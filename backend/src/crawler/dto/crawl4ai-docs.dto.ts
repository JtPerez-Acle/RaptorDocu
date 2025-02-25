import {
  IsBoolean,
  IsOptional,
  IsPositive,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for crawling Crawl4AI documentation
 */
export class Crawl4AIDocsDto {
  @ApiPropertyOptional({
    description: 'Maximum number of pages to crawl',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @IsPositive()
  @Max(1000)
  maxPages?: number;

  @ApiPropertyOptional({
    description: 'Whether to generate summaries for the documentation',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  generateSummaries?: boolean;
}