import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('health')
@ApiTags('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'The service is healthy',
    type: Object,
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'backend',
      version: '0.1.0',
    };
  }
}