import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { CrawlerService } from '../service/crawler.service';
import { StartCrawlDto } from '../dto/start-crawl.dto';
import { Crawl4AIDocsDto } from '../dto/crawl4ai-docs.dto';
import { CrawlResponse } from '../interfaces/crawl-response.interface';

describe('CrawlerService', () => {
  let service: CrawlerService;
  let httpService: HttpService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrawlerService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'CRAWLER_API_URL') return 'http://crawler:3000/api/v1';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CrawlerService>(CrawlerService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startCrawl', () => {
    it('should start a new crawl job', async () => {
      const startCrawlDto: StartCrawlDto = {
        url: 'https://example.com',
        maxPages: 100,
        includePatterns: ['https://example.com/*'],
        excludePatterns: ['*.js', '*.css'],
        generateSummaries: true,
      };

      const mockResponse: CrawlResponse = {
        jobId: 'test-job-id',
        status: 'started',
        url: 'https://example.com',
        pageCount: null,
        embeddedCount: null,
        summarizedCount: null,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(
        of({
          status: 202,
          statusText: 'Accepted',
          headers: {},
          config: { url: 'http://crawler:3000/api/v1/crawl' } as any,
          data: mockResponse,
        }),
      );

      const result = await service.startCrawl(startCrawlDto);

      expect(result).toEqual(mockResponse);
      expect(httpService.post).toHaveBeenCalledWith(
        'http://crawler:3000/api/v1/crawl',
        startCrawlDto,
      );
    });

    it('should throw an error if the API call fails', async () => {
      const startCrawlDto: StartCrawlDto = {
        url: 'https://example.com',
      };

      jest.spyOn(httpService, 'post').mockImplementation(() => {
        throw new Error('API call failed');
      });

      await expect(service.startCrawl(startCrawlDto)).rejects.toThrow(
        'Failed to start crawl job: API call failed',
      );
    });
  });

  describe('getCrawlStatus', () => {
    it('should get the status of a crawl job', async () => {
      const mockResponse: CrawlResponse = {
        jobId: 'test-job-id',
        status: 'completed',
        url: 'https://example.com',
        pageCount: 10,
        embeddedCount: 8,
        summarizedCount: 8,
      };

      jest.spyOn(httpService, 'get').mockReturnValue(
        of({
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { url: 'http://crawler:3000/api/v1/crawl/test-job-id' } as any,
          data: mockResponse,
        }),
      );

      const result = await service.getCrawlStatus('test-job-id');

      expect(result).toEqual(mockResponse);
      expect(httpService.get).toHaveBeenCalledWith(
        'http://crawler:3000/api/v1/crawl/test-job-id',
      );
    });

    it('should throw an error if the API call fails', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw new Error('API call failed');
      });

      await expect(service.getCrawlStatus('test-job-id')).rejects.toThrow(
        'Failed to get crawl status: API call failed',
      );
    });
  });

  describe('crawlCrawl4aiDocs', () => {
    it('should crawl Crawl4AI documentation', async () => {
      const crawl4aiDocsDto: Crawl4AIDocsDto = {
        maxPages: 50,
        generateSummaries: true,
      };

      const mockResponse: CrawlResponse = {
        jobId: 'test-job-id',
        status: 'started',
        url: 'https://crawl4ai.com/mkdocs/',
        pageCount: null,
        embeddedCount: null,
        summarizedCount: null,
      };

      jest.spyOn(httpService, 'post').mockReturnValue(
        of({
          status: 202,
          statusText: 'Accepted',
          headers: {},
          config: { url: 'http://crawler:3000/api/v1/crawl/crawl4ai-docs' } as any,
          data: mockResponse,
        }),
      );

      const result = await service.crawlCrawl4aiDocs(crawl4aiDocsDto);

      expect(result).toEqual(mockResponse);
      expect(httpService.post).toHaveBeenCalledWith(
        'http://crawler:3000/api/v1/crawl/crawl4ai-docs',
        crawl4aiDocsDto,
      );
    });

    it('should throw an error if the API call fails', async () => {
      jest.spyOn(httpService, 'post').mockImplementation(() => {
        throw new Error('API call failed');
      });

      await expect(service.crawlCrawl4aiDocs({})).rejects.toThrow(
        'Failed to crawl Crawl4AI documentation: API call failed',
      );
    });
  });
});