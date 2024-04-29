import { sendAnswerOneByUser } from './helpers/answers-tests-helpers';
import { createFiveQuestions } from './helpers/qustions-tests-helpers';
import jwt from 'jsonwebtoken';
import { userInputModel } from '../src/users/models/users-model';
import { appSettings } from '../src/app.settings';
import { AppModule } from '../src/app.module';
import { AppController } from '../src/app.controller';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { createUser } from './helpers/users-tests-helpers';
import process from 'process';

describe('tests for questions', () => {
  let appController: AppController;
  let app: INestApplication;
  let httpServer: any;

  beforeAll(async () => {
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
    await request(httpServer).delete('/testing/all-data');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Отправить ответ на следующий неотвеченный вопрос в активной паре - answer', () => {
    it('Возвращает статус 401', async () => {
      const creatResponse = await request(httpServer)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .send({
          answer: 'string',
        })
        .expect(401);
    });

    it('Возвращает статус 403, Если текущий пользователь не входит в активную пару или же еще пара не активна', async () => {
      const model: userInputModel = {
        login: 'userOne',
        password: 'userOne2023',
        email: 'userOne@mail.com',
      };
      const resultCreatedFiveQusetions = await createFiveQuestions(
        'admin',
        'qwerty',
        httpServer,
      );
      expect(resultCreatedFiveQusetions).toEqual(true);

      const user = await createUser('admin', 'qwerty', model, httpServer);
      const AccessToken = jwt.sign(
        { userId: user.user.id },
        process.env.JWT_SECRET!,
        { expiresIn: 100 },
      );
      const headersJWT = { Authorization: `Bearer ${AccessToken}` };

      expect.setState({ userOne: user.user });

      const creatPair = await request(httpServer)
        .post('/pair-game-quiz/pairs/connection')
        .set(headersJWT)
        .expect(200);

      const sendAnswerByNotActivePair = await request(httpServer)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set(headersJWT)
        .send({
          answer: 'первый',
        })
        .expect(403);

      const modelTwo: userInputModel = {
        login: 'userTwo',
        password: 'userTwo2023',
        email: 'userTwo@mail.com',
      };

      const userTwo = await createUser('admin', 'qwerty', modelTwo, httpServer);
      const AccessTokenTwo = jwt.sign(
        { userId: userTwo.user.id },
        process.env.JWT_SECRET!,
        { expiresIn: 100 },
      );
      const headersJWTTwo = { Authorization: `Bearer ${AccessTokenTwo}` };
      expect.setState({ userTwo: userTwo.user });

      const connectPairByUserTwo = await request(httpServer)
        .post('/pair-game-quiz/pairs/connection')
        .set(headersJWTTwo)
        .expect(200);
      expect.setState({ pairOne: connectPairByUserTwo.body });

      const modelThree: userInputModel = {
        login: 'userThree',
        password: 'userThree2023',
        email: 'userThree@mail.com',
      };

      const userThree = await createUser(
        'admin',
        'qwerty',
        modelThree,
        httpServer,
      );
      const AccessTokenThree = jwt.sign(
        { userId: userThree.user.id },
        process.env.JWT_SECRET!,
        { expiresIn: 100 },
      );
      const headersJWTThree = { Authorization: `Bearer ${AccessTokenThree}` };
      expect.setState({ userThree: userThree.user });

      const sendAnswerByCurrenUser = await request(httpServer)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set(headersJWTThree)
        .send({
          answer: 'string',
        })
        .expect(403);
    });

    it('Возвращает статус 201, после ответа первого пользователя', async () => {
      const { userOne } = expect.getState();

      const inputData = {
        answer: 'первый',
      };
      const resultAnswer1 = await sendAnswerOneByUser(
        userOne,
        inputData,
        httpServer,
      );
      const resultAnswer2 = await sendAnswerOneByUser(
        userOne,
        inputData,
        httpServer,
      );
      const resultAnswer3 = await sendAnswerOneByUser(
        userOne,
        inputData,
        httpServer,
      );
      const resultAnswer4 = await sendAnswerOneByUser(
        userOne,
        inputData,
        httpServer,
      );
      const resultAnswer5 = await sendAnswerOneByUser(
        userOne,
        inputData,
        httpServer,
      );
    });

    it('Возвращает статус 201, после четырех правильных ответов второго пользователя', async () => {
      const { userTwo } = expect.getState();
      const AccessTokenOne = jwt.sign(
        { userId: userTwo.id },
        process.env.JWT_SECRET!,
        { expiresIn: 100 },
      );
      const headersJWTOne = { Authorization: `Bearer ${AccessTokenOne}` };

      const inputData = {
        answer: 'первый',
      };
      const incorectData = {
        answer: 'второй',
      };

      const resultAnswer1 = await sendAnswerOneByUser(
        userTwo,
        inputData,
        httpServer,
      );
      const resultAnswer2 = await sendAnswerOneByUser(
        userTwo,
        inputData,
        httpServer,
      );
      const resultAnswer3 = await sendAnswerOneByUser(
        userTwo,
        inputData,
        httpServer,
      );
      const resultAnswer4 = await sendAnswerOneByUser(
        userTwo,
        inputData,
        httpServer,
      );

      const resultAnswer5Incorect = await request(httpServer)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set(headersJWTOne)
        .send(incorectData)
        .expect(200);

      expect(resultAnswer5Incorect.body).toEqual({
        questionId: expect.any(String),
        answerStatus: 'Incorrect',
        addedAt: expect.any(String),
      });
    });

    it('Возвращает статус 403, после 6 ответа первого пользователя', async () => {
      const { userOne } = expect.getState();

      const AccessTokenOne = jwt.sign(
        { userId: userOne.id },
        process.env.JWT_SECRET!,
        { expiresIn: 100 },
      );
      const headersJWTOne = { Authorization: `Bearer ${AccessTokenOne}` };

      const sendAnswer6ByUserOne = await request(httpServer)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set(headersJWTOne)
        .send({
          answer: 'не засчитывается',
        })
        .expect(403);
    });
    it('Возвращает статус 403, после 6 ответа второго пользователя', async () => {
      const { userTwo } = expect.getState();

      const AccessTokenOne = jwt.sign(
        { userId: userTwo.id },
        process.env.JWT_SECRET!,
        { expiresIn: 100 },
      );
      const headersJWTOne = { Authorization: `Bearer ${AccessTokenOne}` };

      const sendAnswer6ByUserOne = await request(httpServer)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set(headersJWTOne)
        .send({
          answer: 'не засчитывается',
        })
        .expect(403);
    });

    it('Возвращает mu-current  статус 404, после всех 5  ответов', async () => {
      const { userOne } = expect.getState();
      const AccessTokenOne = jwt.sign(
        { userId: userOne.id },
        process.env.JWT_SECRET!,
        { expiresIn: 100 },
      );
      const headersJWTOne = { Authorization: `Bearer ${AccessTokenOne}` };

      const connectMuCorrent = await request(httpServer)
        .get('/pair-game-quiz/pairs/my-current')
        .set(headersJWTOne)
        .expect(404);
    });

    it('Возвращает игру по id для первого пользователя', async () => {
      const { userOne } = expect.getState();
      const { userTwo } = expect.getState();
      const { pairOne } = expect.getState();

      const AccessTokenOne = jwt.sign(
        { userId: userOne.id },
        process.env.JWT_SECRET!,
        { expiresIn: 100 },
      );
      const headersJWTOne = { Authorization: `Bearer ${AccessTokenOne}` };

      const creatResponse = await request(httpServer)
        .get(`/pair-game-quiz/pairs/${pairOne.id}`)
        .set(headersJWTOne)
        .expect(200);

      expect(creatResponse.body).toEqual({
        id: pairOne.id,
        firstPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userOne.id,
            login: userOne.login,
          },
          score: 6,
        },
        secondPlayerProgress: {
          answers: [
            {
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: 'Correct',
              addedAt: expect.any(String),
            },
            {
              questionId: expect.any(String),
              answerStatus: 'Incorrect',
              addedAt: expect.any(String),
            },
          ],
          player: {
            id: userTwo.id,
            login: userTwo.login,
          },
          score: 4,
        },
        questions: [
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
          {
            id: expect.any(String),
            body: expect.any(String),
          },
        ],
        status: 'Finished',
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
      });
    });
  });
});
