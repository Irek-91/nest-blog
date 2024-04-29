import {
  answerViewModel,
  AnswerInputModel,
} from './../../src/quiz.pair/model/games.model';
import jwt from 'jsonwebtoken';

import request from 'supertest';
import process from 'process';
export const sendAnswerOneByUser = async (
  user: any,
  model: AnswerInputModel,
  httpServer: any,
): Promise<{
  result: request.Response;
  answer: answerViewModel;
}> => {
  const AccessTokenOne = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    {
      expiresIn: 100,
    },
  );
  const headersJWTOne = { Authorization: `Bearer ${AccessTokenOne}` };

  const result = await request(httpServer)
    .post('/pair-game-quiz/pairs/my-current/answers')
    .set(headersJWTOne)
    .send(model)
    .expect(200);

  expect(result.body).toEqual({
    questionId: expect.any(String),
    answerStatus: expect.any(String),
    addedAt: expect.any(String),
  });
  const answer = result.body;
  return { result, answer };
};
