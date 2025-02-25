import { IsNotEmpty, IsOptional, IsPositive, IsString, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for search query parameters
 */
export class SearchQueryDto {
  @ApiProperty({
    description: 'The search query',
    example: 'How to use Weaviate with NestJS',
  })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    example: 10,
    default: 20,
  })
  @IsOptional()
  @IsPositive()
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by document source',
    example: 'crawl4ai.com',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Filter by document version',
    example: 'latest',
  })
  @IsOptional()
  @IsString()
  version?: string;
}