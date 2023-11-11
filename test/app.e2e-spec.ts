// import { Test, TestingModule } from '@nestjs/testing';
// import { NestFactory } from '@nestjs/core'
// import { INestApplication} from '@nestjs/common';
// import { AppService } from '../src/app.service';
// import { AppController } from '../src/app.controller';
// import { AppModule } from '../src/app.module';
// import { appSettings } from '../src/app.settings';
// import request from 'supertest';
// import { after } from 'node:test';



// describe('AppController', () => {
//   let appController: AppController;
//   let app: INestApplication;
//   let httpServer: any;


//   beforeEach(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//       controllers: [AppController],
//       providers: [AppService]
//     }).compile();

//     //appController = app.get<AppController>(AppController);
//     app = moduleFixture.createNestApplication()
//         appSettings(app)
//         await app.init()
//         httpServer = app.getHttpServer()
//   })
  
//   afterAll(async () => {
//     await app.close()
//   })

//   describe('root', () => {
//     it('/ (GET)', () => {
//       return request(httpServer)
//         .get('/')
//         .expect(200)
//         .expect('Hello World! Hello Irek');
//     });
//   });
// });
