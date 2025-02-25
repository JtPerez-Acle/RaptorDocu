import { Test, TestingModule } from '@nestjs/testing';
import { CrawlerController } from '../controllers/crawler.controller';
import { CrawlerService } from '../service/crawler.service';
import { StartCrawlDto } from '../dto/start-crawl.dto';
import { Crawl4AIDocsDto } from '../dto/crawl4ai-docs.dto';

describe('CrawlerController', () => {
  let controller: CrawlerController;
  let service: CrawlerService;

  const mockCrawlResponse = {
    jobId: 'test-job-id',
    status: 'started',
    url: 'https://example.com',
    pageCount: null,
    embeddedCount: null,
    summarizedCount: null,
  };

  const mockCrawlStatusResponse = {
    jobId: 'test-job-id',
    status: 'completed',
    url: 'https://example.com',
    pageCount: 10,
    embeddedCount: 8,
    summarizedCount: 8,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrawlerController],
      providers: [
        {
          provide: CrawlerService,
          useValue: {
            startCrawl: jest.fn(),
            getCrawlStatus: jest.fn(),
            crawlCrawl4aiDocs: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CrawlerController>(CrawlerController);
    service = module.get<CrawlerService>(CrawlerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      jest.spyOn(service, 'startCrawl').mockResolvedValue(mockCrawlResponse);

      const result = await controller.startCrawl(startCrawlDto);
      expect(result).toEqual(mockCrawlResponse);
      expect(service.startCrawl).toHaveBeenCalledWith(startCrawlDto);
    });
  });

  describe('getCrawlStatus', () => {
    it('should get the status of a crawl job', async () => {
      jest.spyOn(service, 'getCrawlStatus').mockResolvedValue(mockCrawlStatusResponse);

      const result = await controller.getCrawlStatus('test-job-id');
      expect(result).toEqual(mockCrawlStatusResponse);
      expect(service.getCrawlStatus).toHaveBeenCalledWith('test-job-id');
    });
  });

  describe('crawlCrawl4aiDocs', () => {
    it('should crawl Crawl4AI documentation', async () => {
      const crawl4aiDocsDto: Crawl4AIDocsDto = {
        maxPages: 50,
        generateSummaries: true,
      };

      jest.spyOn(service, 'crawlCrawl4aiDocs').mockResolvedValue(mockCrawlStatusResponse);

      const result = await controller.crawlCrawl4aiDocs(crawl4aiDocsDto);
      expect(result).toEqual(mockCrawlStatusResponse);
      expect(service.crawlCrawl4aiDocs).toHaveBeenCalledWith(crawl4aiDocsDto);
    });

    it('should use default values if not provided', async () => {
      jest.spyOn(service, 'crawlCrawl4aiDocs').mockResolvedValue(mockCrawlStatusResponse);

      const result = await controller.crawlCrawl4aiDocs({});
      expect(result).toEqual(mockCrawlStatusResponse);
      expect(service.crawlCrawl4aiDocs).toHaveBeenCalledWith({});
    });
  });
});