// import { Test, TestingModule } from '@nestjs/testing';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { AppModule } from './app.module';
// import { appSettings } from 'src/app.settings';
// import { NestFactory } from '@nestjs/core'
// import { INestApplication} from '@nestjs/common';


// describe('AppController', () => {
//   let appController: AppController;
//   let app: INestApplication;
//   let httpServer: any;


//   beforeEach(async () => {
//     const moduleFixture: TestingModule = await Test.createTestingModule({
//       imports: [AppModule],
//       controllers: [AppController],
//       providers: [AppService],
//     }).compile();

//     appController = app.get<AppController>(AppController);
//     app = moduleFixture.createNestApplication()
//         appSettings(app)
//         await app.init()
//         httpServer = app.getHttpServer()
//   });

//   describe('root', () => {
//     it('should return "Hello World!"', () => {
//       expect(appController.getHello()).toBe('Hello World!');
//     });
//   });
// });
