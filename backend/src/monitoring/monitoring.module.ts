import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PerformanceInterceptor } from './performance.interceptor';

@Module({
  providers: [
    MonitoringService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
  exports: [MonitoringService],
})
export class MonitoringModule {}