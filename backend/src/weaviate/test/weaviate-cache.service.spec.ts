import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { WeaviateCacheService } from '../service/weaviate-cache.service';
import { WeaviateService } from '../service/weaviate.service';
import { Document, SearchResult } from '../models/document.model';

describe('WeaviateCacheService', () => {
  let service: WeaviateCacheService;
  let weaviateService: WeaviateService;
  let cacheManager: any;

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

  const mockDocument: Document = {
    id: 'doc-1',
    content: 'Test content 1',
    metadata: {
      title: 'Test document 1',
      url: 'https://example.com/doc1',
      source: 'example.com',
      version: 'latest',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeaviateCacheService,
        {
          provide: WeaviateService,
          useValue: {
            search: jest.fn(),
            getDocumentById: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => 300), // TTL in seconds
          },
        },
      ],
    }).compile();

    service = module.get<WeaviateCacheService>(WeaviateCacheService);
    weaviateService = module.get<WeaviateService>(WeaviateService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should return cached results if available', async () => {
      const query = 'test query';
      const cacheKey = `search:${query}:10`;

      jest.spyOn(cacheManager, 'get').mockResolvedValue(mockSearchResults);

      const result = await service.search(query, 10);

      expect(result).toEqual(mockSearchResults);
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(weaviateService.search).not.toHaveBeenCalled();
    });

    it('should fetch and cache results if not in cache', async () => {
      const query = 'test query';
      const cacheKey = `search:${query}:10`;

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(weaviateService, 'search').mockResolvedValue(mockSearchResults);

      const result = await service.search(query, 10);

      expect(result).toEqual(mockSearchResults);
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(weaviateService.search).toHaveBeenCalledWith(query, 10, undefined);
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, mockSearchResults, 300);
    });

    it('should not cache when filters are applied', async () => {
      const query = 'test query';
      const filters = { source: 'example.com' };

      jest.spyOn(weaviateService, 'search').mockResolvedValue(mockSearchResults);

      const result = await service.search(query, 10, filters);

      expect(result).toEqual(mockSearchResults);
      expect(cacheManager.get).not.toHaveBeenCalled();
      expect(weaviateService.search).toHaveBeenCalledWith(query, 10, filters);
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('getDocumentById', () => {
    it('should return cached document if available', async () => {
      const docId = 'doc-1';
      const cacheKey = `document:${docId}`;

      jest.spyOn(cacheManager, 'get').mockResolvedValue(mockDocument);

      const result = await service.getDocumentById(docId);

      expect(result).toEqual(mockDocument);
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(weaviateService.getDocumentById).not.toHaveBeenCalled();
    });

    it('should fetch and cache document if not in cache', async () => {
      const docId = 'doc-1';
      const cacheKey = `document:${docId}`;

      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(weaviateService, 'getDocumentById').mockResolvedValue(mockDocument);

      const result = await service.getDocumentById(docId);

      expect(result).toEqual(mockDocument);
      expect(cacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(weaviateService.getDocumentById).toHaveBeenCalledWith(docId);
      expect(cacheManager.set).toHaveBeenCalledWith(cacheKey, mockDocument, 300);
    });
  });
});