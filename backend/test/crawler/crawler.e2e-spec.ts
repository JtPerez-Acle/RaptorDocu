import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CrawlerModule } from '../../src/crawler/crawler.module';

describe('CrawlerController (e2e)', () => {
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/crawler/crawl (POST)', () => {
    it('should return 400 if url is missing', () => {
      return request(app.getHttpServer())
        .post('/api/crawler/crawl')
        .send({})
        .expect(400);
    });

    it('should return 400 if url is invalid', () => {
      return request(app.getHttpServer())
        .post('/api/crawler/crawl')
        .send({ url: 'invalid-url' })
        .expect(400);
    });

    it('should accept valid crawl request', () => {
      // This test is mocked to avoid actual API calls
      // In a real scenario, you would use nock or similar to mock external requests
      return request(app.getHttpServer())
        .post('/api/crawler/crawl')
        .send({ url: 'https://docs.example.com', depth: 2 })
        .expect(202)
        .expect((res) => {
          expect(res.body).toHaveProperty('jobId');
          expect(res.body).toHaveProperty('status');
        });
    });
  });

  describe('/api/crawler/status/:jobId (GET)', () => {
    it('should return 404 for non-existent job', () => {
      return request(app.getHttpServer())
        .get('/api/crawler/status/non-existent-job')
        .expect(404);
    });

    it('should return job status for valid job ID', () => {
      // This would need to be mocked or use a known job ID
      const mockJobId = 'mock-job-id';
      
      // First we mock the job creation
      return request(app.getHttpServer())
        .post('/api/crawler/crawl')
        .send({ url: 'https://docs.example.com', depth: 1 })
        .expect(202)
        .then((res) => {
          const jobId = res.body.jobId || mockJobId;
          
          // Then we check its status
          return request(app.getHttpServer())
            .get(`/api/crawler/status/${jobId}`)
            .expect(200)
            .expect((res) => {
              expect(res.body).toHaveProperty('status');
              expect(res.body).toHaveProperty('jobId');
            });
        });
    });
  });
});