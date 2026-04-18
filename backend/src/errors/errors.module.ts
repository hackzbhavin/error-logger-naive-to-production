import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorEvent } from './errors.entity';
import { ErrorsController } from './errors.controller';
import { ErrorsService } from './errors.service';

@Module({
  imports: [TypeOrmModule.forFeature([ErrorEvent])],
  controllers: [ErrorsController],
  providers: [ErrorsService],
})
export class ErrorsModule {}
