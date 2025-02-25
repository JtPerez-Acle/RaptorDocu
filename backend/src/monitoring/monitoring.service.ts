import { Injectable, Logger } from '@nestjs/common';

export interface PerformanceMetric {
  path: string;
  method: string;
  duration: number;
  timestamp: Date;
  statusCode: number;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetricsLength = 1000; // Limit the array size to prevent memory leaks

  /**
   * Records a performance metric for an API call
   * @param metric The performance metric to record
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Log the metric
    this.logger.log(
      `${metric.method} ${metric.path} - ${metric.statusCode} - ${metric.duration}ms`,
    );
    
    // Prevent unlimited growth of the metrics array
    if (this.metrics.length > this.maxMetricsLength) {
      this.metrics.shift();
    }
  }

  /**
   * Gets all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  /**
   * Gets the average response time for a specific endpoint
   * @param path The endpoint path
   * @param method The HTTP method
   */
  getAverageResponseTime(path?: string, method?: string): number {
    const filteredMetrics = this.metrics.filter(
      (metric) =>
        (path ? metric.path === path : true) &&
        (method ? metric.method === method : true),
    );

    if (filteredMetrics.length === 0) {
      return 0;
    }

    const totalDuration = filteredMetrics.reduce(
      (sum, metric) => sum + metric.duration,
      0,
    );
    return totalDuration / filteredMetrics.length;
  }

  /**
   * Gets metrics summary grouped by endpoint
   */
  getMetricsSummary(): Record<string, { count: number; avgDuration: number; minDuration: number; maxDuration: number }> {
    const summary: Record<string, { 
      count: number; 
      totalDuration: number; 
      minDuration: number; 
      maxDuration: number 
    }> = {};

    this.metrics.forEach((metric) => {
      const key = `${metric.method} ${metric.path}`;
      
      if (!summary[key]) {
        summary[key] = {
          count: 0,
          totalDuration: 0,
          minDuration: Infinity,
          maxDuration: 0,
        };
      }
      
      summary[key].count += 1;
      summary[key].totalDuration += metric.duration;
      summary[key].minDuration = Math.min(summary[key].minDuration, metric.duration);
      summary[key].maxDuration = Math.max(summary[key].maxDuration, metric.duration);
    });

    // Calculate averages
    const result: Record<string, any> = {};
    Object.keys(summary).forEach((key) => {
      const { count, totalDuration, minDuration, maxDuration } = summary[key];
      result[key] = {
        count,
        avgDuration: totalDuration / count,
        minDuration: minDuration === Infinity ? 0 : minDuration,
        maxDuration,
      };
    });

    return result;
  }
}