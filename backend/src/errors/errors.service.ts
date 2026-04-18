import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import { LogErrorDto } from './dto/log-error.dto';
import { ErrorEvent } from './errors.entity';

@Injectable()
export class ErrorsService {
  constructor(
    @InjectRepository(ErrorEvent)
    private readonly repo: Repository<ErrorEvent>,
  ) {}

  async log(dto: LogErrorDto): Promise<void> {
    const fingerprint = createHash('sha256')
      .update(dto.message)
      .digest('hex')
      .slice(0, 64);

    // Two DB calls on every request — blocks until both complete
    const existing = await this.repo.findOne({ where: { fingerprint } });

    if (existing) {
      existing.count += 1;
      existing.lastSeenAt = new Date();
      await this.repo.save(existing);
    } else {
      await this.repo.save({
        message: dto.message,
        stackTrace: dto.stackTrace ?? null,
        fingerprint,
        count: 1,
      });
    }
  }
}
