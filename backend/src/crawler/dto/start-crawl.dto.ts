import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  IsArray,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for starting a crawl job
 */
export class StartCrawlDto {
  @ApiProperty({
    description: 'Base URL of the documentation website',
    example: 'https://example.com',
  })
  @IsUrl({
    require_tld: true,
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['http', 'https'],
  })
  @IsNotEmpty()
  url: string;

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
    description: 'List of URL patterns to include',
    example: ['https://example.com/*'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includePatterns?: string[];

  @ApiPropertyOptional({
    description: 'List of URL patterns to exclude',
    example: ['*.js', '*.css'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludePatterns?: string[];

  @ApiPropertyOptional({
    description: 'Whether to generate summaries for the documentation',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  generateSummaries?: boolean;
}