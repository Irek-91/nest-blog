import { userInputModel } from './../src/users/models/users-model';
import { postInputModel, postInputModelSpecific } from '../src/posts/model/post-model';
import { blogInput } from '../src/blogs/models/blogs-model';
import { appSettings } from '../src/app.settings';
import { AppModule } from '../src/app.module';
import request from 'supertest'
import { MongoClient, ObjectId } from 'mongodb';
import { createBlogSa } from './helpers/blogs-tests-helpers';
import { createPost, createPostSpecific } from './helpers/posts-tests-helpers';
import { createUser } from './helpers/users-tests-helpers';
import { createComment } from './helpers/comment_created';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';


// const mongoUri = process.env.MONGO_URL;
// if (!mongoUri) {
//     throw new Error ('URL doesn\'t found')
// }
// const client = new MongoClient(mongoUri)

describe ('tests for posts', () => {
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

    
    describe('return post tests', () => {

    it ('return posts ', async () => {
        const creatResponse = await request(httpServer)
            .get('/posts')
            .expect(200)
        const getPosts = creatResponse.body
        expect(getPosts).toEqual({pagesCount: 0,
                                  page: 1,
                                  pageSize: 10,
                                  totalCount: 0,
                                  items: []
                                 })

    })

    it ('error 404 is returned, there is no such user', async () => {
        await request(httpServer)
                .get('/posts/:5')
                .expect(404)
    })
    })

    describe('create post tests', () => {
    
        
        it ('создаем пост', async () => {
        
        const model: blogInput = {
            name: 'namePost',
            description: 'create post tests',
            websiteUrl: 'https://samurai.it-incubator.com',
        }
        const res = await createBlogSa('admin', 'qwerty', model, httpServer)
        expect.setState({blog: res.body})
        const {blog} = expect.getState()

        const data: postInputModel = {
            title: "string",
            shortDescription: "string",
            content: "string",
            blogId: blog.id,
        }
        const creatResponse = await createPost('admin', 'qwerty', data, httpServer)
        const getPosts = creatResponse.body
        expect(getPosts).toEqual({
            id: expect.any(String),
            title: data.title,
            shortDescription: data.shortDescription,
            content: data.content,
            blogId: blog.id,
            blogName: blog.name,
            createdAt: getPosts.createdAt,
            extendedLikesInfo: { 
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
              }
          })
        
        expect.setState({post: getPosts})
    })

    it ('создаем пост специальный', async () => {
       
      const {blog} = expect.getState()

      const data: postInputModelSpecific = {
          title: "string",
          shortDescription: "string",
          content: "string",
      }
      const creatResponse = await createPostSpecific('admin', 'qwerty', blog.id, data, httpServer)
      const getPostsTwo = creatResponse.body
      expect(creatResponse.status).toBe(201)
      expect(getPostsTwo).toEqual({
          id: expect.any(String),
          title: data.title,
          shortDescription: data.shortDescription,
          content: data.content,
          blogId: blog.id,
          blogName: blog.name,
          createdAt: getPostsTwo.createdAt,
          extendedLikesInfo: { 
              likesCount: 0,
              dislikesCount: 0,
              myStatus: 'None',
              newestLikes: []
            }
        })
      
      expect.setState({postSpecific: getPostsTwo})
  })

    
    it('should return 200 status code and created post', async () => {
        const {post} = expect.getState()
        const {blog} = expect.getState()

        const res = await request(httpServer).get(`/posts/${post.id}`)
        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            id: expect.any(String),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: blog.id,
            blogName: blog.name,
            createdAt: post.createdAt,
            extendedLikesInfo: { 
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: expect.any(Array)
              }
            })
    })

    it('обновление поста', async () => {
        const {post} = expect.getState()
        const {blog} = expect.getState()

        const updatePostData: postInputModel = {
            title: "string",
            shortDescription: "string",
            content: "string",
            blogId: blog.id
          }
        const result = await request(httpServer).put(`/posts/${post.id}`)
                                      .set({Authorization: 'Basic YWRtaW46cXdlcnR5'})
                                      .send(updatePostData)
                                      .expect(204)
        const updateResult = await request(httpServer).get(`/posts/${post.id}`)

        expect(result.status).toBe(204)
        expect(updateResult.body).toEqual({
            id: expect.any(String),
            title: updatePostData.title,
            shortDescription: updatePostData.shortDescription,
            content: updatePostData.content,
            blogId: expect.any(String),
            blogName: expect.any(String),
            createdAt: post.createdAt,
            extendedLikesInfo: { 
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: expect.any(Array)
              }
            }
        )
    })

    it('создание коментария для поста', async () => {
        const {blog} = expect.getState()
        const {post} = expect.getState()
        const userModel: userInputModel= {
            login: 'userModel1',
            password: 'panda2023',
            email: 'panda@mail.com',
        }
        const user = await createUser('admin', 'qwerty', userModel, httpServer)
        const userOne = user
        expect.setState({userOne: userOne})
        const newCommentData = {
                content: "coments of post!!!!!!!!!!!!!!!"    
        }
    
        const createCommment = await createComment(post.id, newCommentData, 201, userOne.user.id, httpServer)
        const result = await request(httpServer).get(`/posts/${post.id}/comments`)
        expect(result.status).toBe(200)
        expect(result.body).toEqual({
                pagesCount: expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: 1,
                items: [
                  {
                    id: expect.any(String),
                    content: newCommentData.content,
                    commentatorInfo: {
                      userId: userOne.user!.id,
                      userLogin: userOne.user!.login
                    },
                    createdAt: expect.any(String),
                    likesInfo: {
                      likesCount: 0,
                      dislikesCount: 0,
                      myStatus: "None"
                    }
                  }
                ]
            })
        const dataIncorect = {
            content: "comentlength min 20"    
        }

        const commentIncorect = await createComment(post.id, dataIncorect, 400, userOne.user.id, httpServer)
        expect(commentIncorect.response.status).toBe(400)
        expect(commentIncorect.response.body).toEqual(
                {
                    "errorsMessages": [
                      {
                        "message": expect.any(String),
                        "field": "content"
                      }
                    ]
                  }
            )
        })
        
    it('лайк поста не корректным body likeStatus', async () => {
      const {blog} = expect.getState()
      const {post} = expect.getState()
      const {userOne} = expect.getState()
      const likeStatusDataIncorect = {
        "likeStatus": ""
      }
      
      const getResultUpdateLikeIncorect = await request(httpServer).put(`/posts/${post.id}/like-status`)
                    .set(userOne.headers)
                    .send(likeStatusDataIncorect)
                    .expect(400)
      expect(getResultUpdateLikeIncorect.body).toEqual({
        "errorsMessages": [
          {
            "message": expect.any(String),
            "field": "likeStatus"
          }
        ]
      })
    })      
    
    it('лайк поста одним пользователем', async () => {
      const {blog} = expect.getState()
      const {post} = expect.getState()
      const {userOne} = expect.getState()

      const dislike = {
        "likeStatus": "Dislike"
      }
      const like = {
        "likeStatus": "Like"
      }
      const updateLike = await request(httpServer).put(`/posts/${post.id}/like-status`)
                      .set(userOne.headers)
                      .send(like)
                      .expect(204)

      const resUpdateLikeForUserOne = await request(httpServer).get(`/posts/${post.id}`)
                    .set(userOne.headers)

      expect(resUpdateLikeForUserOne.body).toEqual({
          id: post.id,
          title: expect.any(String),
          shortDescription: expect.any(String),
          content: expect.any(String),
          blogId: blog.id,
          blogName: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "Like",
            newestLikes: [{
              addedAt: expect.any(String),
              userId: userOne.user.id,
              login: userOne.user.login
            }
          ]
          }
      })
    })

    it('лайк поста повторно одним пользователем like of like, ', async () => {
        const {blog} = expect.getState()
        const {post} = expect.getState()
        const {userOne} = expect.getState()
  
        const dislike = {
          "likeStatus": "Dislike"
        }
        const like = {
          "likeStatus": "Like"
        }
      const againUpdateLike = await request(httpServer).put(`/posts/${post.id}/like-status`)
                    .set(userOne.headers)
                    .send(like)
                    .expect(204)

      const resUpdateLikeOfLike = await request(httpServer).get(`/posts/${post.id}`)
                                .set(userOne.headers)
      expect(resUpdateLikeOfLike.body).toEqual({
          id: post.id,
          title: expect.any(String),
          shortDescription: expect.any(String),
          content: expect.any(String),
          blogId: blog.id,
          blogName: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 1,
            dislikesCount: 0,
            myStatus: "Like",
            newestLikes: [{
              addedAt: expect.any(String),
              userId: userOne.user.id,
              login: userOne.user.login
            }
          ]
          }
      })

      const updateLikeOfDislike = await request(httpServer).put(`/posts/${post.id}/like-status`)
                    .set(userOne.headers)
                    .send(dislike)
                    .expect(204)
      const resUpdateLikeOfDislike = await request(httpServer).get(`/posts/${post.id}`)
                                .set(userOne.headers)              

      expect(resUpdateLikeOfDislike.body).toEqual({
          id: post.id,
          title: expect.any(String),
          shortDescription: expect.any(String),
          content: expect.any(String),
          blogId: blog.id,
          blogName: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 1,
            myStatus: "Dislike",
            newestLikes: [
          ]
          }
      })


    })




  })


    it('лайк поста', async () => {
      const {blog} = expect.getState()
      const {post} = expect.getState()
      const {userOne} = expect.getState()
      const userModelTwo: userInputModel = {
        login: 'userModel2',
        password: 'nosorog2023',
        email: 'nosorog@mail.com',
      }
      const userResponse = await createUser('admin', 'qwerty', userModelTwo, httpServer)
      const userTwo = userResponse
      expect.setState({userTwo: userResponse})
      
      const userModelThree: userInputModel = {
        login: 'userModel3',
        password: 'userFree2023',
        email: 'userFree@mail.com',
      }
      const userResponseThree = await createUser('admin', 'qwerty', userModelThree, httpServer)
      const userThree = userResponseThree
      expect.setState({userThree: userResponse})
      
      const userModelFour: userInputModel = {
        login: 'userModel4',
        password: 'userFour2023',
        email: 'userFour@mail.com',
      }
      const userResponseFour = await createUser('admin', 'qwerty', userModelFour, httpServer)
      const userFour = userResponseFour
      expect.setState({userFour: userResponse})

      const userModelFive: userInputModel = {
        login: 'userModel5',
        password: 'userFive2023',
        email: 'userFive@mail.com',
      }
      const userResponseFive = await createUser('admin', 'qwerty', userModelFive, httpServer)
      const userFive = userResponseFive
      expect.setState({userFive: userResponse})

      const dislike = {
        "likeStatus": "Dislike"
      }
      const like = {
        "likeStatus": "Like"
      }


      const getResultUpdateLike = await request(httpServer).put(`/posts/${post.id}/like-status`)
                    .set(userOne.headers)
                    .send(like)
                    .expect(204)
      const getResultUpdateLikeTwo = await request(httpServer).put(`/posts/${post.id}/like-status`)
                    .set(userTwo.headers)
                    .send(dislike)
                    .expect(204)
      const getResultUpdateFree = await request(httpServer).put(`/posts/${post.id}/like-status`)
                    .set(userThree.headers)
                    .send(like)
                    .expect(204)
      const getResultUpdateFour = await request(httpServer).put(`/posts/${post.id}/like-status`)
                    .set(userFour.headers)
                    .send(like)
                    .expect(204)
      const getResultUpdateFive = await request(httpServer).put(`/posts/${post.id}/like-status`)
                    .set(userFive.headers)
                    .send(like)
                    .expect(204)


      const res = await request(httpServer).get(`/posts/${post.id}`)
                    .set(userOne.headers)

      expect(res.body).toEqual({
          id: post.id,
          title: expect.any(String),
          shortDescription: expect.any(String),
          content: expect.any(String),
          blogId: blog.id,
          blogName: expect.any(String),
          createdAt: expect.any(String),
          extendedLikesInfo: {
            likesCount: 4,
            dislikesCount: 1,
            myStatus: "Like",
            newestLikes: [{
              addedAt: expect.any(String),
              userId: userFive.user.id,
              login: userFive.user.login
            },
            {
              addedAt: expect.any(String),
              userId: userFour.user.id,
              login: userFour.user.login
            },
            {
              addedAt: expect.any(String),
              userId: userThree.user.id,
              login: userThree.user.login
            }
          ]
          }
      })

   })


  })