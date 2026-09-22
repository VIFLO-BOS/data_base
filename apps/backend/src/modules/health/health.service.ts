import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
@Injectable()
export class HealthService {
  constructor(private readonly db: DataSource) {}
  async ready() {
    let timer: ReturnType<typeof setTimeout>;
    try {
      await Promise.race([
        this.db.query('SELECT 1'),
        new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), 2000); }),
      ]);
      return { status: 'ready' };
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    } finally { clearTimeout(timer!); }
  }
}
