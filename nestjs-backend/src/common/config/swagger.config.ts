import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export class SwaggerConfig {
    static setup(app: INestApplication): void {
        const config = new DocumentBuilder()
            .setTitle('NetConnect API')
            .setDescription('API documentation for NetConnect network management application')
            .setVersion('1.0')
            .addTag('auth', 'Authentication endpoints')
            .addTag('users', 'User management endpoints')
            .addTag('payments', 'Payment management endpoints')
            .addTag('notifications', 'Notification management endpoints')
            .addTag('uploads', 'File upload endpoints')
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
}