/**
 * NestJS Application Entry Point
 * Bootstraps the API server with global guards, interceptors, and Swagger.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigModule, ConfigService } from '@nestjs/config';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  
  // Configure body parsers with increased payload limits
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const config = app.get(ConfigService);

  // CORS - allow frontend to call the api. MUST be before rate limit and helmet so blocked requests get headers.
  app.enableCors({
    origin: config.get<string>('app.frontendUrl'),
    credentials: true,
  });

  // Security headers
  app.use(helmet());

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5000, // Increased limit from 100 to 5000 for smoother development/usage
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  // Global validation pipe — strips unknown fields, transforms types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger setup: API documentation at api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Annotator Platform API')
    .setDescription('Staff & Tasker Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // API versioning prefix
  app.setGlobalPrefix('api/v1');

  const port = config.get<number>('app.port') || 3001;
  await app.listen(port);
  console.log(`API running at http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);

  // Log startup information
  
}
bootstrap();
