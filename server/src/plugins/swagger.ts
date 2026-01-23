import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

/**
 * Swagger/OpenAPI documentation plugin
 */
async function swaggerPluginImpl(fastify: FastifyInstance): Promise<void> {
  await fastify.register(swagger, {
    mode: 'dynamic',
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Playground Angular 21 - API',
        description: 'API documentation for Playground Angular 21',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Products', description: 'Product management endpoints' },
        { name: 'Stock', description: 'Stock adjustment endpoints' },
        { name: 'Health', description: 'System health endpoints' },
      ],
    },
  });
  await fastify.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
  });
}

export const swaggerPlugin = fp(swaggerPluginImpl, {
  name: 'swagger-plugin',
});
