import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';
import 'reflect-metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.setGlobalPrefix('api/v1', { exclude: ['/metrics'] });

  await app.listen(process.env.PORT ?? 9001);
  console.log('Server running on http://localhost:9001/api/v1');
}
bootstrap();
