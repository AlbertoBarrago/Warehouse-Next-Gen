import type { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.get('/health', {
        schema: {
            tags: ['Health'],
            summary: 'Health check endpoint',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        status: {type: 'string'},
                        timestamp: {type: 'string'},
                    },
                },
            },
        },
    }, async () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
    }));
}