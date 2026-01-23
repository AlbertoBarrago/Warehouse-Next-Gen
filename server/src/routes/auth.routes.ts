import type { FastifyInstance } from 'fastify';
import {
  validateCredentials,
  sanitizeUser,
  findUserById,
} from '../data/users.js';
import type {
  LoginBody,
  LoginResponse,
  ApiResponse,
  SafeUser,
  JwtPayload,
} from '../types';

/**
 * Authentication routes
 */
export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  /**
   * POST /api/auth/login
   */
  fastify.post<{ Body: LoginBody }>(
      '/login',
      {
        schema: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          consumes: ['application/json'],
          produces: ['application/json'],
          body: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', format: 'email' },
              password: { type: 'string', minLength: 1 },
            },
          },
          response: {
            200: {
              type: 'object',
              required: ['success', 'data'],
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'object',
                  required: ['user', 'token'],
                  properties: {
                    user: {
                      type: 'object',
                      required: ['id', 'email', 'name', 'role'],
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        role: { type: 'string' },
                      },
                    },
                    token: { type: 'string' },
                  },
                },
              },
            },
            401: {
              type: 'object',
              required: ['success', 'error', 'message'],
              properties: {
                success: { type: 'boolean' },
                error: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      async (request, reply): Promise<ApiResponse<LoginResponse>> => {
        const { email, password } = request.body;

        const user = validateCredentials(email, password);

        if (!user) {
          reply.code(401);
          return {
            success: false,
            error: 'Unauthorized',
            message: 'Invalid email or password',
          };
        }

        const safeUser = sanitizeUser(user);

        const token = fastify.jwt.sign({
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        return {
          success: true,
          data: {
            user: safeUser,
            token,
          },
        };
      }
  );

  /**
   * POST /api/auth/logout
   */
  fastify.post(
      '/logout',
      {
        preHandler: [fastify.authenticate],
        schema: {
          tags: ['Auth'],
          summary: 'Logout current user',
          security: [{ bearerAuth: [] }],
          response: {
            200: {
              type: 'object',
              required: ['success', 'message'],
              properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      async (): Promise<ApiResponse<{ message: string }>> => {
        return {
          success: true,
          message: 'Logged out successfully',
        };
      }
  );

  /**
   * GET /api/auth/me
   */
  fastify.get(
      '/me',
      {
        preHandler: [fastify.authenticate],
        schema: {
          tags: ['Auth'],
          summary: 'Get current user profile',
          security: [{ bearerAuth: [] }],
          response: {
            200: {
              type: 'object',
              required: ['success', 'data'],
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'object',
                  required: ['id', 'email', 'name', 'role'],
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
              },
            },
            401: {
              type: 'object',
              required: ['success', 'error'],
              properties: {
                success: { type: 'boolean' },
                error: { type: 'string' },
              },
            },
            404: {
              type: 'object',
              required: ['success', 'error'],
              properties: {
                success: { type: 'boolean' },
                error: { type: 'string' },
              },
            },
          },
        },
      },
      async (request, reply): Promise<ApiResponse<SafeUser>> => {
        const jwtUser = request.user as JwtPayload;
        const userId = jwtUser?.userId;

        if (!userId) {
          reply.code(401);
          return { success: false, error: 'Unauthorized' };
        }

        const user = findUserById(userId);

        if (!user) {
          reply.code(404);
          return { success: false, error: 'User not found' };
        }

        return {
          success: true,
          data: sanitizeUser(user),
        };
      }
  );

  /**
   * POST /api/auth/refresh
   */
  fastify.post(
      '/refresh',
      {
        preHandler: [fastify.authenticate],
        schema: {
          tags: ['Auth'],
          summary: 'Refresh JWT token',
          security: [{ bearerAuth: [] }],
          response: {
            200: {
              type: 'object',
              required: ['success', 'data'],
              properties: {
                success: { type: 'boolean' },
                data: {
                  type: 'object',
                  required: ['token'],
                  properties: {
                    token: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      async (request): Promise<ApiResponse<{ token: string }>> => {
        const { userId, email, role } = request.user as JwtPayload;

        const token = fastify.jwt.sign({ userId, email, role });

        return {
          success: true,
          data: { token },
        };
      }
  );
}
