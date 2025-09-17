import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { logger } from './config/logger';
import { corsOptions } from './config/cors';
import { connectMongo } from './db/mongo';
import { requestContext } from './middlewares/requestContext';
import { errorHandler, notFound } from './middlewares/errorHandler';
import api from './modules';

export async function createServer() {
  await connectMongo();

  const app = express();
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));

  // requestId logging için önce
  app.use(requestContext);

  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        // pino-http v10: ignore fonksiyonu
        ignore: (req) => req.url === '/healthz' || req.url === '/livez',
      },
      customProps: (_req, res) => ({
        service: 'learncompass-api',
        requestId: res.locals.requestId,
        env: env.NODE_ENV,
      }),
    }),
  );

  // root health (ops)
  app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));
  app.get('/livez', (_req, res) => res.status(200).send('ok'));

  // API routes
  app.use('/api/v1', api);

  // 404 + error handler
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
