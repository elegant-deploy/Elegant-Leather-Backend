import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { IoAdapter } from '@nestjs/platform-socket.io';

// Load environment variables
dotenv.config();

let serverInstance: any = null;

async function createServer() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  // app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: true, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', credentials: true });
  app.setGlobalPrefix('api');
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp;
}

// Vercel expects the module to export a handler function. Export an async function that
// initializes the Nest app once (cold start) and reuses the Express instance.
module.exports = async function vercelHandler(req: any, res: any) {
  try {
    if (!serverInstance) {
      serverInstance = await createServer();
    }
    return serverInstance(req, res);
  } catch (err) {
    console.error('Serverless handler error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
};

// Local dev: when not running on Vercel, start a normal listener
if (!process.env.VERCEL) {
  (async () => {
    const expressApp = await createServer();
    const port = process.env.PORT ?? 4000;
    expressApp.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Application is running on: http://localhost:${port}`);
      console.log(`🚀 Application is accessible at: http://0.0.0.0:${port}`);
      console.log(`🔌 Socket.IO server is ready`);
    });
  })();
}
