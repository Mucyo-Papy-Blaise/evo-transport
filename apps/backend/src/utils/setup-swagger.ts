import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('EVO Transport API')
    .setDescription('EVO Transport - Bus & Electric Vehicle Booking Platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      } as SecuritySchemeObject,
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Bookings', 'Booking management endpoints')
    .addTag('Vehicles', 'Vehicle management endpoints')
    .addTag('Drivers', 'Driver management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  // Add custom CSS or options if needed
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'EVO Transport API Docs',
  });
}
