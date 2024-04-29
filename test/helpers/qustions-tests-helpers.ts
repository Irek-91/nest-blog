import request from 'supertest';
import {
  QuestionInputModel,
  questionViewModel,
} from '../../src/quiz.questions/model/questionModel';

export const createQuestions = async (
  saLogin: string,
  saPwd: string,
  model: QuestionInputModel,
  httpServer: any,
): Promise<{ response: request.Response; question: questionViewModel }> => {
  const response = await request(httpServer)
    .post('/sa/quiz/questions')
    .auth(saLogin, saPwd)
    .send(model);
  const question = response.body;
  return { response, question };
};
export const createFiveQuestions = async (
  saLogin: string,
  saPwd: string,
  httpServer: any,
): Promise<boolean> => {
  const model1 = {
    body: 'Первый вопрос викторины',
    correctAnswers: ['первый'],
  };
  const model2 = {
    body: 'Второй вопрос викторины',
    correctAnswers: ['первый'],
  };

  const model3 = {
    body: 'Третий вопрос викторины',
    correctAnswers: ['первый'],
  };
  const model4 = {
    body: 'Четвертый вопрос викторины',
    correctAnswers: ['первый'],
  };

  const model5 = {
    body: 'Пятый вопрос викторины',
    correctAnswers: ['первый'],
  };

  const res1 = await request(httpServer)
    .post('/sa/quiz/questions')
    .auth(saLogin, saPwd)
    .send(model1);
  const res2 = await request(httpServer)
    .post('/sa/quiz/questions')
    .auth(saLogin, saPwd)
    .send(model2);
  const res3 = await request(httpServer)
    .post('/sa/quiz/questions')
    .auth(saLogin, saPwd)
    .send(model3);
  const res4 = await request(httpServer)
    .post('/sa/quiz/questions')
    .auth(saLogin, saPwd)
    .send(model4);
  const res5 = await request(httpServer)
    .post('/sa/quiz/questions')
    .auth(saLogin, saPwd)
    .send(model5);
  expect(res1.status).toBe(201);
  expect(res2.status).toBe(201);
  expect(res3.status).toBe(201);
  expect(res4.status).toBe(201);
  expect(res5.status).toBe(201);

  return true;
};
