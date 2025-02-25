import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MonitoringService } from './monitoring.service';

/**
 * Interceptor that tracks API request performance metrics
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly monitoringService: MonitoringService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();
    const { method, path } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - startTime;
          
          this.monitoringService.recordMetric({
            path,
            method,
            duration,
            timestamp: new Date(),
            statusCode,
          });
        },
        error: () => {
          const duration = Date.now() - startTime;
          
          this.monitoringService.recordMetric({
            path,
            method,
            duration,
            timestamp: new Date(),
            statusCode: 500, // Assuming error is 500 for simplicity
          });
        },
      }),
    );
  }
}