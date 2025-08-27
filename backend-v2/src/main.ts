import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 5000);
  const environment = configService.get<string>('NODE_ENV', 'development');

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: environment === 'production',
    crossOriginEmbedderPolicy: environment === 'production',
  }));

  // Compression middleware
  app.use(compression());

  // Logging middleware
  if (environment !== 'test') {
    app.use(morgan('combined'));
  }

  // CORS configuration
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Tenant-ID',
      'X-API-Version',
    ],
  });

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TenantInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger documentation
  if (environment !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ISOFlow4 API')
      .setDescription('Sistema de Gestión de Calidad ISO 9001 - API Documentation')
      .setVersion('2.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-Tenant-ID',
          in: 'header',
          description: 'Tenant ID for multi-tenant operations',
        },
        'tenant-key',
      )
      .addTag('Authentication', 'Endpoints de autenticación y autorización')
      .addTag('Tenants', 'Gestión de organizaciones y tenants')
      .addTag('Users', 'Gestión de usuarios y perfiles')
      .addTag('Documents', 'Gestión documental y control de versiones')
      .addTag('Processes', 'Gestión de procesos y mapas de proceso')
      .addTag('Audits', 'Gestión de auditorías y planes de auditoría')
      .addTag('NC & CAPA', 'No conformidades y acciones correctivas')
      .addTag('Training', 'Capacitaciones y competencias')
      .addTag('Indicators', 'Indicadores y métricas de rendimiento')
      .addTag('Reports', 'Reportes y business intelligence')
      .addTag('Notifications', 'Sistema de notificaciones')
      .addTag('Search', 'Búsqueda de texto completo')
      .addTag('Health', 'Endpoints de salud y monitoreo')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  // Graceful shutdown
  app.enableShutdownHooks();

  await app.listen(port);
  
  console.log(`
  🚀 ISOFlow4 Backend v2.0.0 is running!
  
  📱 Application: http://localhost:${port}
  📚 API Documentation: http://localhost:${port}/api/docs
  🌍 Environment: ${environment}
  🏢 Multi-tenant: Enabled
  🔐 Authentication: JWT + RBAC
  📊 Monitoring: OpenTelemetry Ready
  
  `);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});