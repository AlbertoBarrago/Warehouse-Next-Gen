import Fastify from 'fastify';
import {
  corsPlugin,
  helmetPlugin,
  jwtPlugin,
  rateLimitPlugin,
  sensiblePlugin,
  swaggerPlugin,
} from './plugins';
import { authRoutes, productRoutes, healthRoutes } from './routes';

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 3000;

/**
 * Build and configure Fastify application
 */
async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register plugins in order
  await fastify.register(sensiblePlugin);
  await fastify.register(corsPlugin);
  await fastify.register(helmetPlugin);
  await fastify.register(rateLimitPlugin);
  await fastify.register(swaggerPlugin);
  await fastify.register(jwtPlugin);

  // Health route /health
  await fastify.register(healthRoutes);

  // Register routes with /api prefix
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(productRoutes, { prefix: '/api/products' });

  // Legacy endpoint for inventory (same as products, for frontend compatibility)
  await fastify.register(productRoutes, { prefix: '/api/inventory/products' });

  return fastify;
}

/**
 * Start the server
 */
async function start() {
  try {
    const fastify = await buildApp();

    await fastify.listen({ host: HOST, port: PORT });

    console.log(`
  Playground Angular 21 - API
  ───────────────────────────────────────
  Server:  http://localhost:${PORT}
  Docs:    http://localhost:${PORT}/documentation
  Health:  http://localhost:${PORT}/health

  Test users:
    admin@warehouse.com / admin123
    manager@warehouse.com / manager123
    demo@warehouse.com / demo
    `);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

start().then((_) => console.log(
    `Server started successfully`
));
