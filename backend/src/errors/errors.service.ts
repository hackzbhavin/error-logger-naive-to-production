import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Repository } from 'typeorm';
import { Histogram } from 'prom-client';
import { createHash } from 'crypto';
import { LogErrorDto } from './dto/log-error.dto';
import { ErrorEvent } from './errors.entity';
import { METRIC_MYSQL_DURATION } from '../shared/metrics/metrics.module';

@Injectable()
export class ErrorsService {
  constructor(
    @InjectRepository(ErrorEvent)
    private readonly repo: Repository<ErrorEvent>,
    @InjectMetric(METRIC_MYSQL_DURATION)
    private readonly mysqlHistogram: Histogram<string>,
  ) {}

  async log(dto: LogErrorDto): Promise<void> {
    const fingerprint = createHash('sha256')
      .update(dto.message)
      .digest('hex')
      .slice(0, 64);

    // Two DB calls on every request — blocks until both complete
    const endFind = this.mysqlHistogram.startTimer({ operation: 'find_one' });
    const existing = await this.repo.findOne({ where: { fingerprint } });
    endFind();

    if (existing) {
      existing.count += 1;
      existing.lastSeenAt = new Date();
      const endSave = this.mysqlHistogram.startTimer({ operation: 'update' });
      await this.repo.save(existing);
      endSave();
    } else {
      const endSave = this.mysqlHistogram.startTimer({ operation: 'insert' });
      await this.repo.save({
        message: dto.message,
        stackTrace: dto.stackTrace ?? null,
        fingerprint,
        count: 1,
      });
      endSave();
    }
  }
}
