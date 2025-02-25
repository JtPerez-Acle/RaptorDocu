import { Controller, Get, Param, Query, Logger, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WeaviateCacheService } from '../service/weaviate-cache.service';
import { Document, SearchResult } from '../models/document.model';
import { SearchQueryDto } from '../dto/search-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly weaviateService: WeaviateCacheService) {}

  @Get()
  @ApiOperation({ summary: 'Search for documents' })
  @ApiResponse({
    status: 200,
    description: 'List of documents matching the search query',
    type: Object,
  })
  async search(@Query() searchQuery: SearchQueryDto): Promise<SearchResult> {
    this.logger.log(`Searching for: ${searchQuery.query}`);
    
    // Extract filter parameters
    const filters: Record<string, string> = {};
    if (searchQuery.source) filters.source = searchQuery.source;
    if (searchQuery.version) filters.version = searchQuery.version;
    
    const filtersObj = Object.keys(filters).length > 0 ? filters : undefined;
    
    // Use default limit if not provided
    const limit = searchQuery.limit || 20;
    
    return this.weaviateService.search(searchQuery.query, limit, filtersObj);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiParam({ name: 'id', description: 'Document ID' })
  @ApiResponse({
    status: 200,
    description: 'The document',
    type: Object,
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async getDocumentById(@Param('id') id: string): Promise<Document> {
    this.logger.log(`Fetching document with ID: ${id}`);
    try {
      return await this.weaviateService.getDocumentById(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching document: ${error.message}`);
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
  }
}