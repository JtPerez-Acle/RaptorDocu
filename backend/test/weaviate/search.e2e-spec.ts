import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { WeaviateModule } from '../../src/weaviate/weaviate.module';

describe('SearchController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    
    // Important: set the global prefix as in main.ts
    app.setGlobalPrefix('api', {
      exclude: ['/health'],
    });
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/search (POST)', () => {
    it('should return 400 if query is missing', () => {
      return request(app.getHttpServer())
        .post('/api/search')
        .send({})
        .expect(400);
    });

    it('should return search results for valid query', () => {
      // This test is mocked to avoid actual Weaviate calls
      return request(app.getHttpServer())
        .post('/api/search')
        .send({ 
          query: 'How to use RAPTOR?', 
          limit: 5, 
          source: 'documentation'
        })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.results)).toBeTruthy();
          expect(res.body).toHaveProperty('totalResults');
        });
    });
  });

  describe('/api/search/similar (POST)', () => {
    it('should return 400 if documentId is missing', () => {
      return request(app.getHttpServer())
        .post('/api/search/similar')
        .send({})
        .expect(400);
    });

    it('should return similar documents for valid document ID', () => {
      const mockDocumentId = 'mock-doc-id';
      
      return request(app.getHttpServer())
        .post('/api/search/similar')
        .send({ 
          documentId: mockDocumentId, 
          limit: 3 
        })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.results)).toBeTruthy();
          expect(res.body).toHaveProperty('totalResults');
        });
    });
  });

  describe('/api/search/health (GET)', () => {
    it('should return health status of the search service', () => {
      return request(app.getHttpServer())
        .get('/api/search/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('weaviateStatus');
        });
    });
  });
});