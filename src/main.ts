import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  if (process.env.VERCEL) {
    // For Vercel serverless, return the Express instance
    return app.getHttpAdapter().getInstance();
  } else {
    const port = process.env.PORT ?? 3000;
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`🚀 Application is accessible at: http://0.0.0.0:${port}`);
  }
}

// For serverless deployment
if (process.env.VERCEL) {
  module.exports = bootstrap();
} else {
  bootstrap();
}

