import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { WeaviateService } from './weaviate.service';
import { Document, SearchResult } from '../models/document.model';

/**
 * Cached service for interacting with Weaviate vector database
 */
@Injectable()
export class WeaviateCacheService {
  private readonly logger = new Logger(WeaviateCacheService.name);
  private readonly ttl: number;

  constructor(
    private readonly weaviateService: WeaviateService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.ttl = this.configService.get<number>('CACHE_TTL_SECONDS') || 300; // 5 minutes default
  }

  /**
   * Search for documents by semantic similarity with caching
   * @param query The search query
   * @param limit Maximum number of results to return
   * @param filters Optional filters to apply
   * @returns Search results
   */
  async search(
    query: string,
    limit = 10,
    filters?: Record<string, string>,
  ): Promise<SearchResult> {
    // Skip cache when filters are provided
    if (filters && Object.keys(filters).length > 0) {
      this.logger.debug(`Skipping cache for search with filters: ${JSON.stringify(filters)}`);
      return this.weaviateService.search(query, limit, filters);
    }

    const cacheKey = `search:${query}:${limit}`;
    
    try {
      // Try to get from cache
      const cachedResult = await this.cacheManager.get<SearchResult>(cacheKey);
      
      if (cachedResult) {
        this.logger.debug(`Cache hit for query: ${query}`);
        return cachedResult;
      }
      
      // Cache miss, get from service
      this.logger.debug(`Cache miss for query: ${query}`);
      const result = await this.weaviateService.search(query, limit, undefined);
      
      // Store in cache
      await this.cacheManager.set(cacheKey, result, this.ttl);
      
      return result;
    } catch (error) {
      this.logger.error(`Error in cached search: ${error.message}`);
      // On error, fall back to direct service call
      return this.weaviateService.search(query, limit, filters);
    }
  }

  /**
   * Get a document by ID with caching
   * @param id The document ID
   * @returns The document
   */
  async getDocumentById(id: string): Promise<Document> {
    const cacheKey = `document:${id}`;
    
    try {
      // Try to get from cache
      const cachedDocument = await this.cacheManager.get<Document>(cacheKey);
      
      if (cachedDocument) {
        this.logger.debug(`Cache hit for document ID: ${id}`);
        return cachedDocument;
      }
      
      // Cache miss, get from service
      this.logger.debug(`Cache miss for document ID: ${id}`);
      const document = await this.weaviateService.getDocumentById(id);
      
      // Store in cache
      await this.cacheManager.set(cacheKey, document, this.ttl);
      
      return document;
    } catch (error) {
      this.logger.error(`Error in cached getDocumentById: ${error.message}`);
      // On error, fall back to direct service call
      return this.weaviateService.getDocumentById(id);
    }
  }
}