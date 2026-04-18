import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ErrorsModule } from './errors/errors.module';
import { HealthModule } from './shared/health/health.module';
import { MetricsModule } from './shared/metrics/metrics.module';
import { ResponseTimeMiddleware } from './shared/middleware/response-time.middleware';
import { getTypeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrometheusModule.register(),
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    MetricsModule,
    ErrorsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResponseTimeMiddleware).forRoutes('*');
  }
}
