import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { ErrorEvent } from '../src/errors/errors.entity';

describe('ErrorsController (e2e)', () => {
  let app: INestApplication;
  const mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    query: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(ErrorEvent))
      .useValue(mockRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1', { exclude: ['/metrics'] });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo.findOne.mockResolvedValue(null);
    mockRepo.save.mockResolvedValue({});
  });

  it('POST /api/v1/errors/log → 200 with { status: "saved" }', () => {
    return request(app.getHttpServer())
      .post('/api/v1/errors/log')
      .send({ message: 'TypeError: cannot read foo' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.status).toBe('saved');
      });
  });

  it('POST /api/v1/errors/log → 400 when message is missing', () => {
    return request(app.getHttpServer())
      .post('/api/v1/errors/log')
      .send({})
      .expect(400);
  });

  it('POST /api/v1/errors/log → 400 when message exceeds 500 chars', () => {
    return request(app.getHttpServer())
      .post('/api/v1/errors/log')
      .send({ message: 'x'.repeat(501) })
      .expect(400);
  });

  it('GET /metrics → returns Prometheus text format', () => {
    return request(app.getHttpServer())
      .get('/metrics')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain('http_request_duration_seconds');
      });
  });
});
