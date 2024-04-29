import {
  userInputModel,
  userViewModel,
} from '../../src/users/models/users-model';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import * as process from 'process';

type headers = {
  Authorization: string;
};

export const createUser = async (
  saLogin: string,
  saPwd: string,
  model: userInputModel,
  httpServer: any,
): Promise<{
  response: request.Response;
  user: userViewModel;
  headers: headers;
}> => {
  const response = await request(httpServer)
    .post('/sa/users')
    .auth(saLogin, saPwd)
    .send(model);
  const user = response.body;
  const AccessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: 2000,
  });
  const headers = { Authorization: `Bearer ${AccessToken}` };
  return { response, user, headers };
};
