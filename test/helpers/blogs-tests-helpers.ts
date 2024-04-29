import { blogInput } from '../../src/blogs/models/blogs-model';
import request from 'supertest';
import jwt from 'jsonwebtoken';

export const createBlog = async (
  saLogin: string,
  saPwd: string,
  model: blogInput,
  httpServer: any,
) => {
  const result = await request(httpServer)
    .post('/blogs')
    .auth(saLogin, saPwd)
    .send(model);
  return result;
};

export const createBlogSa = async (
  saLogin: string,
  saPwd: string,
  model: blogInput,
  httpServer: any,
) => {
  const result = await request(httpServer)
    .post('/sa/blogs')
    .auth(saLogin, saPwd)
    .send(model);
  return result;
};

export const createBlogByBlogger = async (
  userId: string,
  model: blogInput,
  httpServer: any,
) => {
  const AccessTokenOne = jwt.sign({ userId: userId }, process.env.JWT_SECRET!, {
    expiresIn: 100,
  });
  const headersJWTOne = { Authorization: `Bearer ${AccessTokenOne}` };

  const result = await request(httpServer)
    .post('/blogger/blogs')
    .set(headersJWTOne)
    .send(model);
  //.expect(201)

  return result;
};
