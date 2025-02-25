import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import weaviate, { WeaviateClient } from 'weaviate-ts-client';
import { Document, SearchResult } from '../models/document.model';

/**
 * The class name for documentation objects in Weaviate
 */
const DOC_CLASS_NAME = 'Documentation';

/**
 * Service for interacting with Weaviate vector database
 */
@Injectable()
export class WeaviateService {
  private readonly logger = new Logger(WeaviateService.name);
  private weaviateClient: WeaviateClient;

  constructor(private configService: ConfigService) {
    this.initializeClient();
  }

  /**
   * Initialize the Weaviate client
   */
  private initializeClient(): void {
    try {
      const weaviateUrl = this.configService.get<string>('WEAVIATE_URL');
      const weaviateApiKey = this.configService.get<string>('WEAVIATE_API_KEY');
      const openaiApiKey = this.configService.get<string>('OPENAI_API_KEY');

      if (!weaviateUrl) {
        throw new Error('WEAVIATE_URL is not configured');
      }

      // Initialize the client with appropriate configuration
      if (weaviateApiKey) {
        this.weaviateClient = weaviate.client({
          scheme: weaviateUrl.startsWith('https') ? 'https' : 'http',
          host: weaviateUrl.replace(/^https?:\/\//, ''),
          apiKey: new weaviate.ApiKey(weaviateApiKey),
          headers: openaiApiKey
            ? { 'X-OpenAI-Api-Key': openaiApiKey }
            : undefined,
        });
      } else {
        // Without API key
        this.weaviateClient = weaviate.client({
          scheme: weaviateUrl.startsWith('https') ? 'https' : 'http',
          host: weaviateUrl.replace(/^https?:\/\//, ''),
          headers: openaiApiKey
            ? { 'X-OpenAI-Api-Key': openaiApiKey }
            : undefined,
        });
      }

      this.logger.log(`Connected to Weaviate at ${weaviateUrl}`);
    } catch (error) {
      this.logger.error(`Failed to initialize Weaviate client: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get the Weaviate client
   * @returns The Weaviate client
   */
  private client(): WeaviateClient {
    if (!this.weaviateClient) {
      this.initializeClient();
    }
    return this.weaviateClient;
  }

  /**
   * Search for documents by semantic similarity
   * @param query The search query
   * @param limit Maximum number of results to return
   * @param filters Optional filters to apply
   * @returns Search results
   */
  async search(query: string, limit = 10, filters?: Record<string, string>): Promise<SearchResult> {
    try {
      this.logger.debug(`Searching for: ${query} with limit ${limit}`);
      
      // Build the query
      let queryBuilder = this.client().graphql
        .get()
        .withNearText({ 
          concepts: [query] 
        })
        .withLimit(limit)
        .withFields(`
          _additional {
            id
            certainty
          }
          content
          title
          url
          source
          version
        `);

      // Add filters if provided
      if (filters && Object.keys(filters).length > 0) {
        const whereFilter: Record<string, any> = {};
        
        Object.entries(filters).forEach(([key, value]) => {
          if (['title', 'url', 'source', 'version'].includes(key)) {
            whereFilter[key] = {
              operator: 'Equal',
              valueString: value,
            };
          }
        });
        
        if (Object.keys(whereFilter).length > 0) {
          queryBuilder = queryBuilder.withWhere(whereFilter);
        }
      }

      // Execute the query
      const result = await queryBuilder.do();
      
      // Extract the results
      if (
        result?.data?.Get?.[DOC_CLASS_NAME] && 
        Array.isArray(result.data.Get[DOC_CLASS_NAME])
      ) {
        const docs = result.data.Get[DOC_CLASS_NAME];
        const total = docs.length;
        
        // Transform the results
        const documents: Document[] = docs.map((doc: any) => ({
          id: doc._additional.id,
          content: doc.content,
          metadata: {
            title: doc.title,
            url: doc.url || '',
            source: doc.source || '',
            version: doc.version || 'latest',
          },
          score: doc._additional.certainty || 0,
        }));
        
        this.logger.debug(`Found ${total} documents for query: ${query}`);
        return {
          documents,
          total,
        };
      }
      
      return {
        documents: [],
        total: 0,
      };
    } catch (error) {
      this.logger.error(`Error searching documents: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a document by ID
   * @param id The document ID
   * @returns The document
   */
  async getDocumentById(id: string): Promise<Document> {
    try {
      this.logger.debug(`Fetching document with ID: ${id}`);
      
      const result = await this.client().data
        .getterById()
        .withClassName(DOC_CLASS_NAME)
        .withId(id)
        .do();
      
      if (!result || !result.properties) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
      
      // Safely access properties with type assertion
      const properties = result.properties as Record<string, any>;
      
      return {
        id,
        content: properties.content || '',
        metadata: {
          title: properties.title || 'Untitled',
          url: properties.url || '',
          source: properties.source || '',
          version: properties.version || 'latest',
        },
      };
    } catch (error) {
      this.logger.error(`Error fetching document by ID ${id}: ${error.message}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new Error(`Failed to fetch document: ${error.message}`);
    }
  }
}