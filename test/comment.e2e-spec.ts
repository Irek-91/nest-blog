import { blogInput } from './../src/blogs/models/blogs-model';
import { settings } from './../src/settings';
import { postInputTests } from './../src/posts/model/post-model';
import { userInputModel } from '../src/users/models/users-model';
import  jwt  from 'jsonwebtoken';
import { appSettings } from '../src/app.settings';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import { createBlog } from './helpers/blogs-tests-helpers';
import { ObjectId } from 'mongodb';
import request from 'supertest'
import { createUser } from './helpers/users-tests-helpers'
import { createPost } from './helpers/posts-tests-helpers'
import { createComment } from './helpers/comment_created'
import { log } from 'console'

describe ('tests for comments', () => {

  let app: INestApplication;
  let httpServer: any;
  beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AppModule],
          //controllers: [AppModule, AppController],
          //providers: [BlogsService],
        }).compile();
    
      app = moduleFixture.createNestApplication()
      appSettings(app)
      await app.init()
      httpServer = app.getHttpServer()
      await request(httpServer).delete('/testing/all-data')

  })

  afterAll (async () => {
      await app.close()
  })

    describe('действия с коментариями', () => {
        it ('обновление коментария ', async () => {
            const userModel: userInputModel = {
                login: 'panda',
                password: 'panda2023',
                email: 'panda@mail.com',
            }
            const user = await createUser('admin', 'qwerty', userModel, httpServer)
            const userOne = user.user
            expect.setState({userOne: userOne})

            const model: blogInput = {
                name: 'nameComment',
                description: 'create comment tests',
                websiteUrl: 'https://samurai.it-incubator.com',
            }
            const res = await createBlog('admin', 'qwerty', model, httpServer)
            expect.setState({blog: res.body})
            const {blog} = expect.getState()

            const data: postInputTests = {
                title: "string",
                shortDescription: "string",
                content: "string",
                blogId: blog.id,
                blogName: blog.name,
                createdAt: new Date().toISOString()
            }
            const creatResponse = await createPost('admin', 'qwerty', data, httpServer)
            const getPosts = creatResponse.body
            expect.setState({post: getPosts})
            const {post} = expect.getState()

            const newCommentData = {
                content: "coments of post!!!!!!!!!!!!!!!"    
            }
    
            const createCommment = await createComment(post.id, newCommentData, 201, userOne.id, httpServer)
            const comment = createCommment.createdComment
            const commentId = createCommment.createdComment!.id

            const resultCreated = await request(httpServer).get(`/comments/${commentId}`)
            expect(resultCreated.status).toBe(200)

            expect.setState({comment: comment})      

            const AccessToken = jwt.sign({userId : userOne.id}, settings.JWT_SECRET, {expiresIn: 200})
            const headersJWT = {Authorization: `Bearer ${AccessToken}`}
            
            const updateCommentData = {
                content: "update coments of post!!!!!!!!!!!!!!!"    
            }
            const result = await request(httpServer).put(`/comments/${commentId}`)
                                      .set(headersJWT)
                                      .send(updateCommentData)
                                      .expect(204)
            expect(result.status).toBe(204)

            const resultUpdate = await request(httpServer).get(`/comments/${commentId}`)
            expect(resultUpdate.status).toBe(200)
            expect(resultUpdate.body).toEqual({
                id: expect.any(String),
                content: updateCommentData.content,
                commentatorInfo: {
                  userId: userOne.id,
                  userLogin: userOne.login
                },
                createdAt: expect.any(String),
                likesInfo: {
                  likesCount: 0,
                  dislikesCount: 0,
                  myStatus: "None"
                }
              })
        })

        it ('обновление коментария не тем пользователем ', async () => {
            const {blog} = expect.getState()
            const {post} = expect.getState()
            const {comment} = expect.getState()
            const {userOne} = expect.getState()
            const userModelTwo: userInputModel = {
                login: 'medved',
                password: 'panda2023',
                email: 'panda2023@mail.com',
            }
            const user = await createUser('admin', 'qwerty', userModelTwo, httpServer)
            const userTwo = user.user
            expect.setState({userTwo: userTwo})

            expect.setState({userTwo: userTwo})
            const AccessTokenTwo = jwt.sign({userId : userTwo.id}, settings.JWT_SECRET, {expiresIn: 2000})
            const headersJWTTwo = {Authorization: `Bearer ${AccessTokenTwo}`}
            const updateCommentData = {
                content: "coments of post!!!!!!!!!!!!!!!"    
            }
            const result = await request(httpServer).put(`/comments/${comment.id}`)
                                      .set(headersJWTTwo)
                                      .send(updateCommentData)
                                      .expect(403)
            expect(result.status).toBe(403)


        })
        it ('лайк коментария', async () => {
            const {blog} = expect.getState()
            const {post} = expect.getState()
            const {comment} = expect.getState()
            const {userOne} = expect.getState()
            const {userTwo} = expect.getState()
            const AccessToken = jwt.sign({userId : userOne.id}, settings.JWT_SECRET, {expiresIn: 2000})
            const headersJWTOne = {Authorization: `Bearer ${AccessToken}`}
            const AccessTokenTwo = jwt.sign({userId : userTwo.id}, settings.JWT_SECRET, {expiresIn: 2000})
            const headersJWTTwo = {Authorization: `Bearer ${AccessTokenTwo}`}

            const likeStatusDataOne = {
                likeStatus: "Like"
              }
            const resultOne = await request(httpServer).put(`/comments/${comment.id}/like-status`)
                    .set(headersJWTOne)
                    .send(likeStatusDataOne)
                    .expect(204)
          
            const likeStatusDataTwo = {
                likeStatus: "Dislike"
              }
            const resultTwo = await request(httpServer).put(`/comments/${comment.id}/like-status`)
                    .set(headersJWTTwo)
                    .send(likeStatusDataTwo)
                    .expect(204)
                    
            const resultUpdateLikeForUserOne = await request(httpServer).get(`/comments/${comment.id}`)
            .set(headersJWTOne)

            expect(resultUpdateLikeForUserOne.body).toEqual({
                id: expect.any(String),
                content: expect.any(String),
                commentatorInfo: {
                  userId: userOne.id,
                  userLogin: userOne.login
                },
                createdAt: expect.any(String),
                likesInfo: {
                  likesCount: 1,
                  dislikesCount: 1,
                  myStatus: "Like"
                }
            })

            const resultUpdateLikeForUserTwo = await request(httpServer).get(`/comments/${comment.id}`)
            .set(headersJWTTwo)
            
            expect(resultUpdateLikeForUserTwo.body).toEqual({
                id: expect.any(String),
                content: expect.any(String),
                commentatorInfo: {
                  userId: userOne.id,
                  userLogin: userOne.login
                },
                createdAt: expect.any(String),
                likesInfo: {
                  likesCount: 1,
                  dislikesCount: 1,
                  myStatus: "Dislike"
                }
            })



        })
    })
})