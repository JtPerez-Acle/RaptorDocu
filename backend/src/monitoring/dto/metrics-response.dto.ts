import { ApiProperty } from '@nestjs/swagger';

export class EndpointMetricDto {
  @ApiProperty({ description: 'Number of requests to this endpoint' })
  count: number;

  @ApiProperty({ description: 'Average response time in milliseconds' })
  avgDuration: number;

  @ApiProperty({ description: 'Minimum response time in milliseconds' })
  minDuration: number;

  @ApiProperty({ description: 'Maximum response time in milliseconds' })
  maxDuration: number;
}

export class MetricsResponseDto {
  @ApiProperty({
    description: 'Performance metrics for each endpoint',
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        avgDuration: { type: 'number' },
        minDuration: { type: 'number' },
        maxDuration: { type: 'number' },
      },
    },
    example: {
      'GET /api/health': {
        count: 50,
        avgDuration: 5.2,
        minDuration: 2,
        maxDuration: 15,
      },
      'POST /api/search': {
        count: 30,
        avgDuration: 120.5,
        minDuration: 80,
        maxDuration: 250,
      },
    },
  })
  metrics: Record<string, EndpointMetricDto>;
}