import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';
import { MetricsResponseDto } from './dto/metrics-response.dto';

@Controller('monitoring')
@ApiTags('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get API performance metrics' })
  @ApiResponse({
    status: 200,
    description: 'Returns performance metrics for all endpoints',
    type: MetricsResponseDto,
  })
  getMetrics(): MetricsResponseDto {
    return {
      metrics: this.monitoringService.getMetricsSummary(),
    };
  }
}