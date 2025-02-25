import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from '../controllers/search.controller';
import { WeaviateCacheService } from '../service/weaviate-cache.service';
import { SearchResult } from '../models/document.model';
import { SearchQueryDto } from '../dto/search-query.dto';

describe('SearchController', () => {
  let controller: SearchController;
  let weaviateService: WeaviateCacheService;

  const mockSearchResults: SearchResult = {
    documents: [
      {
        id: 'doc-1',
        content: 'Test content 1',
        metadata: {
          title: 'Test document 1',
          url: 'https://example.com/doc1',
          source: 'example.com',
          version: 'latest',
        },
        score: 0.95,
      },
    ],
    total: 1,
  };
  
  // Complete response with the additional compatibility fields
  const completeResponse = {
    documents: mockSearchResults.documents,
    results: mockSearchResults.documents,
    total: mockSearchResults.total,
    totalResults: mockSearchResults.total
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: WeaviateCacheService,
          useValue: {
            search: jest.fn(),
            getDocumentById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    weaviateService = module.get<WeaviateCacheService>(WeaviateCacheService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should search for documents', async () => {
      const searchQuery: SearchQueryDto = {
        query: 'test query',
        limit: 10,
        source: 'example.com',
      };

      jest.spyOn(weaviateService, 'search').mockResolvedValue(mockSearchResults);

      const result = await controller.search(searchQuery);
      expect(result).toEqual(completeResponse);
      expect(weaviateService.search).toHaveBeenCalledWith(
        'test query',
        10,
        { source: 'example.com' },
      );
    });

    it('should use default limit if not provided', async () => {
      const searchQuery = {
        query: 'test query',
      };

      jest.spyOn(weaviateService, 'search').mockResolvedValue(mockSearchResults);

      const result = await controller.search(searchQuery);
      expect(result).toEqual(completeResponse);
      expect(weaviateService.search).toHaveBeenCalledWith(
        'test query',
        20,
        undefined,
      );
    });
  });

  describe('getDocumentById', () => {
    it('should fetch a document by ID', async () => {
      const document = mockSearchResults.documents[0];
      jest.spyOn(weaviateService, 'getDocumentById').mockResolvedValue(document);

      const result = await controller.getDocumentById('doc-1');
      expect(result).toEqual(document);
      expect(weaviateService.getDocumentById).toHaveBeenCalledWith('doc-1');
    });
  });
});