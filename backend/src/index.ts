import 'tsconfig-paths/register';
import { createServer } from './server';
import { env } from './config/env';
import { logger } from './config/logger';

async function main() {
  try {
    const app = await createServer();
    const server = app.listen(env.PORT, () => {
      logger.info({ port: env.PORT, env: env.NODE_ENV }, '🚀 LearnCompass API listening');
    });

    // nazik kapanış (opsiyonel)
    const shutdown = () => {
      server.close(() => {
        logger.info('🛑 Server closed');
        process.exit(0);
      });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    logger.error({ err }, '❌ Failed to start server');
    process.exit(1);
  }
}

main();
