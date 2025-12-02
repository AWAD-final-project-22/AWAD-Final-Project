import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './presentation/filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser'; // Bỏ * as

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('AWAD Final Project API')
    .setDescription(
      'RESTful API for Gmail client application with authentication and email management.\n\n' +
      '**Features:**\n' +
      '- User authentication (JWT + Google OAuth 2.0)\n' +
      '- Gmail integration (read, send, reply, modify emails)\n' +
      '- Mailbox/Label management\n' +
      '- Email search and pagination\n\n' +
      '**Authentication:**\n' +
      '1. Login with email/password or Google OAuth\n' +
      '2. Use the returned `accessToken` in Authorization header\n' +
      '3. Format: `Bearer <accessToken>`\n'
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
    })
    .addTag('Auth', 'Authentication and authorization endpoints')
    .addTag('Mail', 'Gmail integration - mailboxes, emails, send, reply, modify')
    .addServer(process.env.BACKEND_URL || 'http://localhost:3000', 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'AWAD API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  }); // Swagger UI will be available at /api

  app.use(cookieParser(process.env.COOKIE_SECRET));

  // Register global filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
