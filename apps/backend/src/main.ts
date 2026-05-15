/**
 * NestJS Application Entry Point
 * Bootstraps the API server with global guards, interceptors, and Swagger.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigModule, ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

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

  // CORS - allow frontend to call the api
  app.enableCors({
    origin:config.get<string>('app.frontendUrl'),
    credentials: true,
  });

  // API versioning prefix
  app.setGlobalPrefix('api/v1');

  const port = config.get<number>('app.port') || 3001;
  await app.listen(port);
  console.log(`API running at http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);

  // Log startup information
  
}
bootstrap();
