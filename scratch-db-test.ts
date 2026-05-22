import { NestFactory } from '@nestjs/core';
import { AppModule } from './apps/backend/src/app.module';
import { DashboardAnalyticsService } from './apps/backend/src/modules/dashboard-analytics/dashboard-analytics.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(DashboardAnalyticsService);
  
  console.log('Testing getDashboardSummary...');
  try {
    const start = Date.now();
    const result = await Promise.race([
      service.getDashboardSummary({}),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout!')), 5000))
    ]);
    console.log('Result:', result);
    console.log('Time taken:', Date.now() - start, 'ms');
  } catch (err) {
    console.error('Error:', err);
  }
  
  await app.close();
}

bootstrap();
