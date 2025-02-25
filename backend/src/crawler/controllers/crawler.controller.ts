import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CrawlerService } from '../service/crawler.service';
import { StartCrawlDto } from '../dto/start-crawl.dto';
import { Crawl4AIDocsDto } from '../dto/crawl4ai-docs.dto';
import { CrawlResponse } from '../interfaces/crawl-response.interface';

@ApiTags('crawler')
@Controller('crawler')
export class CrawlerController {
  private readonly logger = new Logger(CrawlerController.name);

  constructor(private readonly crawlerService: CrawlerService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Start a new crawl job' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'The crawl job has been started',
    type: Object,
  })
  async startCrawl(@Body() startCrawlDto: StartCrawlDto): Promise<CrawlResponse> {
    this.logger.log(`Starting crawl for URL: ${startCrawlDto.url}`);
    return this.crawlerService.startCrawl(startCrawlDto);
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Get the status of a crawl job' })
  @ApiParam({ name: 'jobId', description: 'Unique identifier for the crawl job' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The crawl job status',
    type: Object,
  })
  async getCrawlStatus(@Param('jobId') jobId: string): Promise<CrawlResponse> {
    this.logger.log(`Getting status for crawl job: ${jobId}`);
    return this.crawlerService.getCrawlStatus(jobId);
  }

  @Post('crawl4ai-docs')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Crawl Crawl4AI documentation' })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'The Crawl4AI documentation crawl job has been started',
    type: Object,
  })
  async crawlCrawl4aiDocs(@Body() crawl4aiDocsDto: Crawl4AIDocsDto = {}): Promise<CrawlResponse> {
    this.logger.log('Starting crawl for Crawl4AI documentation');
    return this.crawlerService.crawlCrawl4aiDocs(crawl4aiDocsDto);
  }
}