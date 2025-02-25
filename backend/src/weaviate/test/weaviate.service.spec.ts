import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WeaviateService } from '../service/weaviate.service';

describe('WeaviateService', () => {
  let service: WeaviateService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeaviateService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'WEAVIATE_URL') return 'http://weaviate:8080';
              if (key === 'WEAVIATE_API_KEY') return 'test-api-key';
              if (key === 'OPENAI_API_KEY') return 'test-openai-key';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<WeaviateService>(WeaviateService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should search documents by query', async () => {
      // Mock the client search method
      const searchResults = {
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
          {
            id: 'doc-2',
            content: 'Test content 2',
            metadata: {
              title: 'Test document 2',
              url: 'https://example.com/doc2',
              source: 'example.com',
              version: 'latest',
            },
            score: 0.85,
          },
        ],
        total: 2,
      };

      jest.spyOn(service as any, 'client').mockImplementation(() => ({
        graphql: {
          get: jest.fn().mockReturnValue({
            withNearText: jest.fn().mockReturnValue({
              withLimit: jest.fn().mockReturnValue({
                withFields: jest.fn().mockReturnValue({
                  do: jest.fn().mockResolvedValue({
                    data: {
                      Get: {
                        Documentation: [
                          {
                            _additional: {
                              id: 'doc-1',
                              certainty: 0.95,
                            },
                            content: 'Test content 1',
                            title: 'Test document 1',
                            url: 'https://example.com/doc1',
                            source: 'example.com',
                            version: 'latest',
                          },
                          {
                            _additional: {
                              id: 'doc-2',
                              certainty: 0.85,
                            },
                            content: 'Test content 2',
                            title: 'Test document 2',
                            url: 'https://example.com/doc2',
                            source: 'example.com',
                            version: 'latest',
                          },
                        ],
                      },
                    },
                  }),
                }),
              }),
            }),
          }),
        },
      }));

      const result = await service.search('test query', 10);
      expect(result).toEqual(searchResults);
    });

    it('should return empty results when no documents found', async () => {
      jest.spyOn(service as any, 'client').mockImplementation(() => ({
        graphql: {
          get: jest.fn().mockReturnValue({
            withNearText: jest.fn().mockReturnValue({
              withLimit: jest.fn().mockReturnValue({
                withFields: jest.fn().mockReturnValue({
                  do: jest.fn().mockResolvedValue({
                    data: {
                      Get: {
                        Documentation: [],
                      },
                    },
                  }),
                }),
              }),
            }),
          }),
        },
      }));

      const result = await service.search('nonexistent query', 10);
      expect(result).toEqual({ documents: [], total: 0 });
    });

    it('should throw an error when search fails', async () => {
      jest.spyOn(service as any, 'client').mockImplementation(() => ({
        graphql: {
          get: jest.fn().mockReturnValue({
            withNearText: jest.fn().mockReturnValue({
              withLimit: jest.fn().mockReturnValue({
                withFields: jest.fn().mockReturnValue({
                  do: jest.fn().mockRejectedValue(new Error('Search failed')),
                }),
              }),
            }),
          }),
        },
      }));

      await expect(service.search('test query', 10)).rejects.toThrow('Search failed');
    });
  });

  describe('getDocumentById', () => {
    it('should fetch a document by ID', async () => {
      const document = {
        id: 'doc-1',
        content: 'Test content 1',
        metadata: {
          title: 'Test document 1',
          url: 'https://example.com/doc1',
          source: 'example.com',
          version: 'latest',
        },
      };

      // Mock the client with correct properties structure
      jest.spyOn(service as any, 'client').mockImplementation(() => ({
        data: {
          getterById: jest.fn().mockReturnThis(),
          withClassName: jest.fn().mockReturnThis(),
          withId: jest.fn().mockReturnThis(),
          do: jest.fn().mockResolvedValue({
            properties: {
              content: 'Test content 1',
              title: 'Test document 1',
              url: 'https://example.com/doc1',
              source: 'example.com',
              version: 'latest',
            },
          }),
        },
      }));

      const result = await service.getDocumentById('doc-1');
      expect(result).toEqual(document);
    });

    it('should throw an error when document not found', async () => {
      // Mock null response
      jest.spyOn(service as any, 'client').mockImplementation(() => ({
        data: {
          getterById: jest.fn().mockReturnThis(),
          withClassName: jest.fn().mockReturnThis(),
          withId: jest.fn().mockReturnThis(),
          do: jest.fn().mockResolvedValue(null),
        },
      }));

      await expect(service.getDocumentById('nonexistent-id')).rejects.toThrow(
        'Document with ID nonexistent-id not found',
      );
    });
  });
});