import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { IoAdapter } from '@nestjs/platform-socket.io';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // Hide log level messages, only show errors and warnings
  });
  // app.useGlobalPipes(new ValidationPipe()); // Removed global validation to avoid issues with GET requests

  // Enable CORS for all origins
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable Socket.IO adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  return app.getHttpAdapter().getInstance();
}

// Initialize the app
(async () => {
  const app = await bootstrap();
  if (process.env.VERCEL) {
    module.exports = app;
  } else {
    const port = process.env.PORT ?? 4000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Application is running on: http://localhost:${port}`);
      console.log(`🚀 Application is accessible at: http://0.0.0.0:${port}`);
      console.log(`🔌 Socket.IO server is ready`);
    });
  }
})();

