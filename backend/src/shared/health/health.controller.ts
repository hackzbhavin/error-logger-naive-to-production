import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

interface MysqlPool {
  _allConnections: unknown[];
  _freeConnections: unknown[];
  _connectionQueue: unknown[];
  config: { connectionLimit: number };
}

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check() {
    const db = await this.checkDb();
    const status = db.status === 'up' ? 'up' : 'degraded';

    return {
      status,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      services: { db },
    };
  }

  @Get('db')
  async db() {
    return this.checkDb();
  }

  private async checkDb() {
    try {
      await this.dataSource.query('SELECT 1');
      const pool = (this.dataSource.driver as { pool?: MysqlPool }).pool;
      return {
        status: 'up',
        pool_active: pool?._allConnections.length ?? 0,
        pool_free: pool?._freeConnections.length ?? 0,
        pool_queued: pool?._connectionQueue.length ?? 0,
        pool_limit: pool?.config.connectionLimit ?? null,
      };
    } catch {
      return { status: 'down' };
    }
  }
}
