import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/app.settings';
import request from 'supertest';

describe('AppController', () => {
  let app: INestApplication;
  let httpServer: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      //controllers: [],
      //providers: []
    }).compile();

    //appController = app.get<AppController>(AppController);
    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('root', () => {
    it('/ (GET)', () => {
      return request(httpServer)
        .get('/')
        .expect(200)
        .expect('Hello World! Hello Irek');
    });
  });
});
