import { commentViewModel } from './../../src/comments/model/comments-model';
import jwt from 'jsonwebtoken';
import request from 'supertest';

export type comenntInput = {
  content: string;
};

export const createHeadersJWT = async (userId: string) => {
  const AccessToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET!, {
    expiresIn: 100,
  });
  const headersJWT = { Authorization: `Bearer ${AccessToken}` };
  return headersJWT;
};

export const createComment = async (
  postId: string,
  data: comenntInput,
  expectedStatusCode: number,
  userOneId: string,
  httpServer: any,
): Promise<{
  response: request.Response;
  createdComment: null | commentViewModel;
}> => {
  const AccessToken = jwt.sign({ userId: userOneId }, process.env.JWT_SECRET!, {
    expiresIn: 100,
  });
  const headersJWT = { Authorization: `Bearer ${AccessToken}` };

  const response = await request(httpServer)
    .post(`/posts/${postId}/comments`)
    .set(headersJWT)
    .send(data)
    .expect(expectedStatusCode);

  let createdComment = null;

  if (expectedStatusCode === 201) {
    createdComment = response.body;

    expect(createdComment).toEqual({
      id: expect.any(String),
      content: data.content,
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: expect.any(String),
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: expect.any(Number),
        dislikesCount: expect.any(Number),
        myStatus: 'None',
      },
    });
  }

  return { response, createdComment };
};
