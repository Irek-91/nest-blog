import { AppModule } from './../src/app.module';
import { userInputModel } from '../src/users/models/users-model';
import request from 'supertest'
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Body } from '@nestjs/common';
import { appSettings } from '../src/app.settings';
import { blogInput } from '../src/blogs/models/blogs-model';
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


        it('Создаем пользователей', async () => {
            const userOneModel: userInputModel = {
                login: 'userOne',
                password: 'userOne2023',
                email: 'userOne@mail.com',
            }
            const userOne = await createUser('admin', 'qwerty', userOneModel, httpServer)
            expect.setState({ userOne: userOne })

            const userTwoModel: userInputModel = {
                login: 'userTwo',
                password: 'userTwo2023',
                email: 'userTwo@mail.com',
            }
            const userTwo = await createUser('admin', 'qwerty', userTwoModel, httpServer)
            expect.setState({ userTwo: userTwo })

        })

        it('Создаем блог для пользователя и посты', async () => {
            const { userOne } = expect.getState()
            const model: blogInput = {
                name: 'name',
                description: 'description',
                websiteUrl: 'https://samurai.it-incubator.com',
            }
            const blogOne = await createBlogByBlogger(userOne.user.id, model, httpServer)
            expect.setState({ blogOne: blogOne.body })

            const postData = {
                title: "postOne",
                shortDescription: "postOne by blogOne",
                content: "string"
            }

            const post = await request(httpServer).post(`/blogger/blogs/${blogOne.body.id}/posts`).send(postData).set(userOne.headers)
            expect(post.status).toBe(201)
            expect.setState({ postByUserOneBlog1: post.body })
        })
        it('Подписываемся к блогу 1 пользователем 2', async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { blogOne } = expect.getState()

            const res1 = await request(httpServer).post(`/blogs/${123}/subscription`).set(userTwo.headers)
            expect(res1.status).toBe(404)


            const res2 = await request(httpServer).post(`/blogs/${blogOne.id}/subscription`)
            expect(res2.status).toBe(401)

            const res3 = await request(httpServer).post(`/blogs/${blogOne.id}/subscription`).set(userTwo.headers)
            expect(res3.status).toBe(204)

        })

        it('Возвращаем блог, в которм есть один подписчик', async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()

            const { blogOne } = expect.getState()
            const res = await request(httpServer).get(`/blogs/${blogOne.id}`).set(userTwo.headers)


            expect(res.status).toBe(200)
            expect(res.body).toEqual({
                id: expect.any(String),
                name: blogOne.name,
                description: blogOne.description,
                websiteUrl: blogOne.websiteUrl,
                createdAt: expect.any(String),
                isMembership: false,
                images: {
                    wallpaper: expect.any(Object),
                    main: expect.any(Array)
                },
                currentUserSubscriptionStatus: "Subscribed",
                subscribersCount: 1
            })

        })

        it('Отписываемя от блогу 1 пользователем 2', async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { blogOne } = expect.getState()

            const res1 = await request(httpServer).delete(`/blogs/${123}/subscription`).set(userTwo.headers)
            expect(res1.status).toBe(404)


            const res2 = await request(httpServer).delete(`/blogs/${blogOne.id}/subscription`)
            expect(res2.status).toBe(401)

            const res = await request(httpServer).delete(`/blogs/${blogOne.id}/subscription`).set(userTwo.headers)
            expect(res.status).toBe(204)

        })
    })

})