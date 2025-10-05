import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { seedPaymentPlans } from './payment-plans/payment-plans-seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('NetConnect API')
    .setDescription('WiFi operator management system API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Seed payment plans
  try {
    await seedPaymentPlans();
  } catch (error) {
    console.error('Failed to seed payment plans:', error);
  }

  const port = process.env.PORT || 5510;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();