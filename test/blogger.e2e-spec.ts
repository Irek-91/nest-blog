import { postOutput } from './../dist/posts/model/post-model.d';
import jwt from 'jsonwebtoken';
import { settings } from './../src/settings';
import { userInputModel } from '../src/users/models/users-model';
import request from 'supertest'
import { log } from 'console';
import { Test, TestingModule } from '@nestjs/testing';
import { NestFactory } from '@nestjs/core'
import { INestApplication, Body } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/app.settings';
import { blogInput } from '../src/blogs/models/blogs-model';
import { BlogsService } from '../src/blogs/application/blogs.service';
import { createBlogSa, createBlogByBlogger } from './helpers/blogs-tests-helpers';
import { createUser } from './helpers/users-tests-helpers';



describe('tests for blogger', () => {
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

    afterAll(async () => {
        await app.close()
    })


    describe('create blogger tests', () => {

        it('should return 401 status code', async () => {
            const result = await request(httpServer).post('/blogger/blogs')
                .set({ Authorization: `Bearer {AccessTokenOne` })
                .send({} as blogInput)
            expect(result.status).toBe(401)
        })

        it('should return 400 status code with errors', async () => {
            const userOneModel: userInputModel = {
                login: 'userOne',
                password: 'userOne2023',
                email: 'userOne@mail.com',
            }
            const user = await createUser('admin', 'qwerty', userOneModel, httpServer)
            expect.setState({ userOne: user })
            const { userOne } = expect.getState()

            const userThreeModel: userInputModel = {
                login: 'userThree',
                password: 'userThree2023',
                email: 'userThree@mail.com',
            }
            const user3 = await createUser('admin', 'qwerty', userThreeModel, httpServer)
            expect.setState({ userThree: user3 })
            const { userThree } = expect.getState()



            const model: blogInput = {
                name: 'name',
                description: 'description',
                websiteUrl: 'https://samurai.it-incubator.com',
            }
            const errors = {
                errorsMessages: expect.arrayContaining([
                    {
                        field: 'name',
                        message: expect.any(String)
                    },
                    {
                        field: 'description',
                        message: expect.any(String)
                    },
                    {
                        field: 'websiteUrl',
                        message: expect.any(String)
                    }
                ])
            }
            const firstRes = await createBlogByBlogger(userOne.user.id, {} as blogInput, httpServer)
            expect(firstRes.status).toBe(400)
            expect(firstRes.body).toEqual(errors)

            const modelOne: blogInput = {
                name: '',
                description: '',
                websiteUrl: '',
            }

            const secondRes = await createBlogByBlogger(userOne.user.id, modelOne, httpServer)
            expect(secondRes.status).toBe(400)
            expect(secondRes.body).toEqual(errors)



        })

        it('should return 201 status code and created blog', async () => {
            const { userOne } = expect.getState()
            const model: blogInput = {
                name: 'name',
                description: 'description',
                websiteUrl: 'https://samurai.it-incubator.com',
            }
            const res = await createBlogByBlogger(userOne.user.id, model, httpServer)

            expect(res.status).toBe(201)
            expect(res.body).toEqual({
                id: expect.any(String),
                name: model.name,
                description: model.description,
                websiteUrl: model.websiteUrl,
                createdAt: expect.any(String),
                isMembership: false
            })

            expect.setState({ blog: res.body })
        })


        it('Возвращаем блог, который создали', async () => {
            const { userOne } = expect.getState()
            const { blog } = expect.getState()
            const res = await request(httpServer).get(`/blogs/${blog.id}`)


            expect(res.status).toBe(200)
            expect(res.body).toEqual({
                id: expect.any(String),
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: expect.any(String),
                isMembership: false
            })

        })



        it('Возвращает блоги (владельцем которых является текущий пользователь)', async () => {
            const { blog } = expect.getState()
            const { userOne } = expect.getState()
            const model: blogInput = {
                name: 'name2',
                description: 'description',
                websiteUrl: 'https://samurai.it-incubator.com',
            }
            const blog2 = await createBlogByBlogger(userOne.user.id, model, httpServer)
            expect.setState({ blog2: blog2.body })



            const result = await request(httpServer).get(`/blogger/blogs`).set(userOne.headers)
            expect(result.status).toBe(200)
            expect(result.body).toEqual({
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [blog2.body, blog]
            })

        })

        it('Проверка на поиск своих блогов (владельцем которых является другой пользователь)', async () => {
            const { blog } = expect.getState()
            const userTwoModel: userInputModel = {
                login: 'userTwo',
                password: 'userTwo2023',
                email: 'userTwo@mail.com',
            }
            const user = await createUser('admin', 'qwerty', userTwoModel, httpServer)
            expect.setState({ userTwo: user })
            const { userTwo } = expect.getState()

            const res = await request(httpServer).get(`/blogger/blogs`).set(userTwo.headers)
            expect(res.status).toBe(200)
            expect(res.body).toEqual({
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            })

        })

        it('Удаление блога ', async () => {
            const { userTwo } = expect.getState()
            const { userOne } = expect.getState()

            const { blog } = expect.getState()
            const res = await request(httpServer).delete(`/blogger/blogs/${blog.id}`)
            expect(res.status).toBe(401)// проверка удаление неавторизованным пользователем
            const res1 = await request(httpServer).delete(`/blogger/blogs/${blog.id}`).set(userTwo.headers)
            expect(res1.status).toBe(403)// проверка удаление другим пользователем
            const res2 = await request(httpServer).delete(`/blogger/blogs/${1}`).set(userOne.headers)
            expect(res2.status).toBe(404)// проверка удаление несуществующего блога
            const res3 = await request(httpServer).delete(`/blogger/blogs/${blog.id}`).set(userOne.headers)
            expect(res3.status).toBe(204)//удаление блога

            const resusltDelete = await request(httpServer).get(`/blogs/${blog.id}`)
            expect(resusltDelete.status).toBe(404)//проверка удаления блога, вызов блога с ДБ


        })

        it('Создание поста "/blogger/blogs/:blogId/posts":', async () => {
            const { blog2 } = expect.getState()
            const { userOne } = expect.getState()
            const postData = {
                title: "postOne",
                shortDescription: "postOne by blog2",
                content: "string"
            }

            const res = await request(httpServer).post(`/blogger/blogs/${blog2.id}/posts`).send(postData).set(userOne.headers)
            expect(res.status).toBe(201)
            expect(res.body).toEqual({
                id: expect.any(String),
                title: postData.title,
                shortDescription: postData.shortDescription,
                content: postData.content,
                blogId: blog2.id,
                blogName: blog2.name,
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: "None",
                    newestLikes: expect.any(Array)
                }
            })
            expect.setState({ postByUserOneBlog2: res.body })



        })

        it('Забанить блог 2 для userTwo":', async () => {
            const { blog2 } = expect.getState()
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const updateData = {
                isBanned: true,
                banReason: (Math.random() * 1e50).toString(36),
                blogId: blog2.id
            }
            const res = await request(httpServer).put(`/blogger/users/${userTwo.user.id}/ban`)
                .send(updateData).set(userOne.headers)
            expect(res.status).toBe(204)
        })

        it('Написать комментарий, забаненным пользователем userTwo для поста к блогу 2":', async () => {
            const { blog2 } = expect.getState()
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { postByUserOneBlog2 } = expect.getState()

            const inputData = {
                content: "stringstringstringst"
            }
            const res = await request(httpServer).post(`/posts/${postByUserOneBlog2.id}/comments`)
                .send(inputData).set(userTwo.headers)
            expect(res.status).toBe(403)

        })





        it('Ошибка 403, попытка забанить блог 2 для userTwo, который не прнодлежит юзеру', async () => {
            const { blog2 } = expect.getState()
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userThree } = expect.getState()
            const updateData = {
                isBanned: true,
                banReason: (Math.random() * 1e50).toString(36),
                blogId: blog2.id
            }
            const res = await request(httpServer).put(`/blogger/users/${userTwo.user.id}/ban`)
                .send(updateData).set(userThree.headers)
            expect(res.status).toBe(403)
        })

        it('Получить всех забаненных пользователей для блог 2":', async () => {
            const { blog2 } = expect.getState()
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const res = await request(httpServer).get(`/blogger/users/blog/${blog2.id}`)
                .set(userOne.headers)
            expect(res.status).toBe(200)
            expect(res.body).toEqual({
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [
                    {
                        id: userTwo.user.id,
                        login: userTwo.user.login,
                        banInfo: {
                            isBanned: true,
                            banDate: expect.any(String),
                            banReason: expect.any(String)
                        }
                    }
                ]
            })


        })



        it('Разбанить блог 2 для userTwo":', async () => {
            const { blog2 } = expect.getState()
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()


            const updateDataTwo = {
                isBanned: false,
                banReason: (Math.random() * 1e50).toString(36),
                blogId: blog2.id
            }

            const res2 = await request(httpServer).put(`/blogger/users/${userTwo.user.id}/ban`)
                .send(updateDataTwo).set(userOne.headers)
            expect(res2.status).toBe(204)


        })

        it('Написать комментарий, разбаненным пользователем userTwo для поста к блогу 2', async () => {
            const { blog2 } = expect.getState()
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { postByUserOneBlog2 } = expect.getState()

            const inputData = {
                content: "комментарий к первому посту"
            }
            const res = await request(httpServer).post(`/posts/${postByUserOneBlog2.id}/comments`)
                .send(inputData).set(userTwo.headers)
            expect(res.status).toBe(201)

        })

        it('Возвращает все комментарии ко всем сообщениям во всех текущих блогах пользователей', async () => {
            const { blog2 } = expect.getState()
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { postByUserOneBlog2} = expect.getState()

            const postData = {
                title: "postTwo",
                shortDescription: "postTwo by blog2",
                content: "string"
            }

            const postTwo = await request(httpServer).post(`/blogger/blogs/${blog2.id}/posts`).send(postData).set(userOne.headers)
            expect(postTwo.status).toBe(201) //создали второй пост для блога


            const inputData = {
                content: "комментарий ко второму посту"
            }
            const commentByPostTwo = await request(httpServer).post(`/posts/${postTwo.body.id}/comments`)
                .send(inputData).set(userTwo.headers)
            expect(commentByPostTwo.status).toBe(201)


            const getCommentsPostsByBlogger = await request(httpServer).get(`/blogger/blogs/comments`).set(userOne.headers)
            expect(getCommentsPostsByBlogger.status).toBe(200)
            expect(getCommentsPostsByBlogger.body).toEqual({
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [
                    {
                        id: expect.any(String),
                        content: "комментарий ко второму посту",
                        commentatorInfo: {
                            userId: userTwo.user.id,
                            userLogin: userTwo.user.login
                        },
                        createdAt: expect.any(String),
                        likesInfo: {
                            likesCount: 0,
                            dislikesCount: 0,
                            myStatus: "None"
                        },
                        postInfo: {
                            id: postTwo.body.id,
                            title: postTwo.body.title,
                            blogId: postTwo.body.blogId,
                            blogName: expect.any(String)
                        }
                    },
                    {
                        id: expect.any(String),
                        content: "комментарий к первому посту",
                        commentatorInfo: {
                            userId: userTwo.user.id,
                            userLogin: userTwo.user.login
                        },
                        createdAt: expect.any(String),
                        likesInfo: {
                            likesCount: 0,
                            dislikesCount: 0,
                            myStatus: "None"
                        },
                        postInfo: {
                            id: postByUserOneBlog2.id,
                            title: postByUserOneBlog2.title,
                            blogId: postByUserOneBlog2.blogId,
                            blogName: expect.any(String)
                        }
                    }

                ]
            })


        })



    })

})