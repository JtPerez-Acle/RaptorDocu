import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { StartCrawlDto } from '../dto/start-crawl.dto';
import { Crawl4AIDocsDto } from '../dto/crawl4ai-docs.dto';
import { CrawlResponse } from '../interfaces/crawl-response.interface';

/**
 * Service for crawling documentation websites
 */
@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('CRAWLER_API_URL') || 'http://crawler:3000/api/v1';
  }

  /**
   * Start a new crawl job
   * @param dto Crawl request data
   * @returns Information about the started crawl job
   */
  async startCrawl(dto: StartCrawlDto): Promise<CrawlResponse> {
    try {
      this.logger.log(`Starting crawl for URL: ${dto.url}`);
      
      const { data } = await firstValueFrom(
        this.httpService.post<CrawlResponse>(`${this.apiUrl}/crawl`, dto),
      );
      
      this.logger.log(`Started crawl job with ID: ${data.jobId}`);
      
      return data;
    } catch (error) {
      this.logger.error(`Error starting crawl job: ${error.message}`);
      throw new Error(`Failed to start crawl job: ${error.message}`);
    }
  }

  /**
   * Get the status of a crawl job
   * @param jobId Unique identifier for the crawl job
   * @returns Current status of the crawl job
   */
  async getCrawlStatus(jobId: string): Promise<CrawlResponse> {
    try {
      this.logger.log(`Getting status for crawl job: ${jobId}`);
      
      const { data } = await firstValueFrom(
        this.httpService.get<CrawlResponse>(`${this.apiUrl}/crawl/${jobId}`),
      );
      
      this.logger.log(`Crawl job ${jobId} status: ${data.status}`);
      
      return data;
    } catch (error) {
      this.logger.error(`Error getting crawl status: ${error.message}`);
      throw new Error(`Failed to get crawl status: ${error.message}`);
    }
  }

  /**
   * Crawl Crawl4AI documentation and store it in the vector database
   * @param dto Optional parameters for the crawl
   * @returns Information about the crawl operation
   */
  async crawlCrawl4aiDocs(dto: Crawl4AIDocsDto): Promise<CrawlResponse> {
    try {
      this.logger.log('Starting crawl for Crawl4AI documentation');
      
      const { data } = await firstValueFrom(
        this.httpService.post<CrawlResponse>(`${this.apiUrl}/crawl/crawl4ai-docs`, dto),
      );
      
      this.logger.log(`Started Crawl4AI docs crawl job with ID: ${data.jobId}`);
      
      return data;
    } catch (error) {
      this.logger.error(`Error crawling Crawl4AI documentation: ${error.message}`);
      throw new Error(`Failed to crawl Crawl4AI documentation: ${error.message}`);
    }
  }
}