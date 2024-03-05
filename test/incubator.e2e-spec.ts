import { SubscriptionStatus } from '../src/blogs/models/blogs-model';
import { AppModule } from '../src/app.module';
import { userInputModel } from '../src/users/models/users-model';
import request from 'supertest'
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Body } from '@nestjs/common';
import { appSettings } from '../src/app.settings';
import { blogInput } from '../src/blogs/models/blogs-model';
import { createBlogSa, createBlogByBlogger } from './helpers/blogs-tests-helpers';
import { createUser } from './helpers/users-tests-helpers';
import { log } from 'node:console';



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

            const userFreeModel: userInputModel = {
                login: 'userFree',
                password: 'userFree2023',
                email: 'userFree@mail.com',
            }
            const userFree = await createUser('admin', 'qwerty', userFreeModel, httpServer)
            expect.setState({ userFree: userFree })

            const userFourModel: userInputModel = {
                login: 'userFour',
                password: 'userFour2023',
                email: 'userFour@mail.com',
            }
            const userFour = await createUser('admin', 'qwerty', userFourModel, httpServer)
            expect.setState({ userFour: userFour })
        })

        it(`Telegram api integration  blog subscriptions  DELETE -> "blogs/:blogId/subscription"
        User1 create blog1. 
        User2 subscribed to blog1.
        User2 has unsubscribed from blog1.
        Get blog2 by user2.
        Get blog2 by user3.
        Get blog2 by unauthorized user.
        `, async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userFree } = expect.getState()
            const model: blogInput = {
                name: 'blog1',
                description: 'descriptionblog1',
                websiteUrl: 'https://samurai.it-incubator.com',
            }
            const blogOne = await createBlogByBlogger(userOne.user.id, model, httpServer)
            expect.setState({ blog1: blogOne.body })

            const postData = {
                title: "postOne",
                shortDescription: "postOne by blogOne",
                content: "string"
            }

            const post = await request(httpServer).post(`/blogger/blogs/${blogOne.body.id}/posts`).send(postData).set(userOne.headers)
            expect(post.status).toBe(201)
            expect.setState({ postByUserOneBlog1: post.body })

            const subscription = await request(httpServer).post(`/blogs/${blogOne.body.id}/subscription`).set(userTwo.headers)
            expect(subscription.status).toBe(204)

            const unsubscription = await request(httpServer).delete(`/blogs/${blogOne.body.id}/subscription`).set(userTwo.headers)
            expect(unsubscription.status).toBe(204)

            const GetBlog1ByUser2 = await request(httpServer).get(`/blogs/${blogOne.body.id}`).set(userTwo.headers)

            expect(GetBlog1ByUser2.status).toBe(200)
            expect(GetBlog1ByUser2.body).toEqual({
                id: expect.any(String),
                name: blogOne.body.name,
                description: blogOne.body.description,
                websiteUrl: blogOne.body.websiteUrl,
                createdAt: expect.any(String),
                isMembership: false,
                images: {
                    wallpaper: expect.any(Object),
                    main: expect.any(Array)
                },
                currentUserSubscriptionStatus: SubscriptionStatus.Unsubscribed,
                subscribersCount: 0
            })

            const GetBlog1ByUser3 = await request(httpServer).get(`/blogs/${blogOne.body.id}`).set(userFree.headers)

            expect(GetBlog1ByUser3.status).toBe(200)
            expect(GetBlog1ByUser3.body).toEqual({
                id: expect.any(String),
                name: blogOne.body.name,
                description: blogOne.body.description,
                websiteUrl: blogOne.body.websiteUrl,
                createdAt: expect.any(String),
                isMembership: false,
                images: {
                    wallpaper: expect.any(Object),
                    main: expect.any(Array)
                },
                currentUserSubscriptionStatus: SubscriptionStatus.None,
                subscribersCount: 0
            })

            const GetBlog2ByUnauthorizedUser = await request(httpServer).get(`/blogs/${blogOne.body.id}`)

            expect(GetBlog1ByUser3.status).toBe(200)
            expect(GetBlog1ByUser3.body).toEqual({
                id: expect.any(String),
                name: blogOne.body.name,
                description: blogOne.body.description,
                websiteUrl: blogOne.body.websiteUrl,
                createdAt: expect.any(String),
                isMembership: false,
                images: {
                    wallpaper: expect.any(Object),
                    main: expect.any(Array)
                },
                currentUserSubscriptionStatus: SubscriptionStatus.None,
                subscribersCount: 0
            })
        })

        it(`Telegram api integration  blog subscriptions  POST -> "blogs/:blogId/subscription"
        User1 create blog2. 
        User2 subscribed to blog2.
        User2 try to subscribe to blog2 again.
        Get blog2 by user2.
        `, async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userFree } = expect.getState()
            const model: blogInput = {
                name: 'blog2',
                description: 'descriptionblog2',
                websiteUrl: 'https://samurai.it-incubator.com',
            }
            const blog2 = await createBlogByBlogger(userOne.user.id, model, httpServer)
            expect.setState({ blog2: blog2.body })

            const subscription = await request(httpServer).post(`/blogs/${blog2.body.id}/subscription`).set(userTwo.headers)
            expect(subscription.status).toBe(204)

            const tryToSubscribe = await request(httpServer).post(`/blogs/${blog2.body.id}/subscription`).set(userTwo.headers)
            expect(tryToSubscribe.status).toBe(204)


            const GetBlog3ByUser2 = await request(httpServer).get(`/blogs/${blog2.body.id}`).set(userTwo.headers)

            expect(GetBlog3ByUser2.status).toBe(200)
            expect(GetBlog3ByUser2.body).toEqual({
                id: expect.any(String),
                name: blog2.body.name,
                description: blog2.body.description,
                websiteUrl: blog2.body.websiteUrl,
                createdAt: expect.any(String),
                isMembership: false,
                images: {
                    wallpaper: expect.any(Object),
                    main: expect.any(Array)
                },
                currentUserSubscriptionStatus: SubscriptionStatus.Subscribed,
                subscribersCount: 1
            })


        })

        it(`Telegram api integration  blog subscriptions  DELETE -> "blogs/:blogId/subscription": 
            User1 create blog3. 
            User2 subscribed to blog3.
            User3 subscribed to blog3.
      
            User2 has unsubscribed from blog3.
            User2 tries to unsubscribe from blog3 again.
      
            Get blog3 by user2.
        `, async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userFree } = expect.getState()
            const model: blogInput = {
                name: 'blog3',
                description: 'descriptionblog3',
                websiteUrl: 'https://samurai.it-incubator.com',
            }
            const blog3 = await createBlogByBlogger(userOne.user.id, model, httpServer)
            expect.setState({ blog3: blog3.body })

            const subscription = await request(httpServer).post(`/blogs/${blog3.body.id}/subscription`).set(userTwo.headers)
            expect(subscription.status).toBe(204)
            const subscription2 = await request(httpServer).post(`/blogs/${blog3.body.id}/subscription`).set(userFree.headers)
            expect(subscription2.status).toBe(204)
            const unsubscription = await request(httpServer).delete(`/blogs/${blog3.body.id}/subscription`).set(userTwo.headers)
            expect(unsubscription.status).toBe(204)
            const unsubscription2 = await request(httpServer).delete(`/blogs/${blog3.body.id}/subscription`).set(userTwo.headers)
            expect(unsubscription.status).toBe(204)



            const GetBlog4ByUser2 = await request(httpServer).get(`/blogs/${blog3.body.id}`).set(userTwo.headers)

            expect(GetBlog4ByUser2.status).toBe(200)
            expect(GetBlog4ByUser2.body).toEqual({
                id: expect.any(String),
                name: blog3.body.name,
                description: blog3.body.description,
                websiteUrl: blog3.body.websiteUrl,
                createdAt: expect.any(String),
                isMembership: false,
                images: {
                    wallpaper: expect.any(Object),
                    main: expect.any(Array)
                },
                currentUserSubscriptionStatus: SubscriptionStatus.Unsubscribed,
                subscribersCount: 1
            })


        })

        it(`Telegram api integration  blog subscriptions  DELETE -> "blogs/:blogId/subscription": 
            User1 create 4 blogs. 
            User2 subscribed to blog1, 2, 4.
            User3 subscribed to blog1, 2, 4.
            User2 has unsubscribed from blog4.
        
            Get blogs by user2.
            Should return blog list
        `, async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userFree } = expect.getState()
            const { blog1 } = expect.getState()
            const { blog2 } = expect.getState()
            const { blog3 } = expect.getState()


            const model: blogInput = {
                name: 'blog4',
                description: 'descriptionblog4',
                websiteUrl: 'https://samurai.it-incubator.com',
            }
            const blog4 = await createBlogByBlogger(userOne.user.id, model, httpServer)
            expect.setState({ blog4: blog4.body })

            const subscriptionUserTwo1 = await request(httpServer).post(`/blogs/${blog1.id}/subscription`).set(userTwo.headers)
            expect(subscriptionUserTwo1.status).toBe(204)
            const subscriptionUserTwo2 = await request(httpServer).post(`/blogs/${blog2.id}/subscription`).set(userTwo.headers)
            expect(subscriptionUserTwo2.status).toBe(204)
            const subscriptionUserTwo3 = await request(httpServer).post(`/blogs/${blog4.body.id}/subscription`).set(userTwo.headers)
            expect(subscriptionUserTwo3.status).toBe(204)

            const subscriptionUserFree1 = await request(httpServer).post(`/blogs/${blog1.id}/subscription`).set(userFree.headers)
            expect(subscriptionUserFree1.status).toBe(204)
            const subscriptionUserFree2 = await request(httpServer).post(`/blogs/${blog2.id}/subscription`).set(userFree.headers)
            expect(subscriptionUserFree2.status).toBe(204)
            const subscriptionUserFree3 = await request(httpServer).post(`/blogs/${blog4.body.id}/subscription`).set(userFree.headers)
            expect(subscriptionUserFree3.status).toBe(204)

            const unsubscriptionUserTwo = await request(httpServer).delete(`/blogs/${blog4.body.id}/subscription`).set(userTwo.headers)
            expect(unsubscriptionUserTwo.status).toBe(204)



            const GetBlogsByUser2 = await request(httpServer).get(`/blogs`).set(userTwo.headers)

            expect(GetBlogsByUser2.status).toBe(200)
            expect(GetBlogsByUser2.body).toEqual(
                {
                    pagesCount: 1,
                    page: 1,
                    pageSize: 10,
                    totalCount: 4,
                    items: [{
                        id: expect.any(String),
                        name: blog4.body.name,
                        description: blog4.body.description,
                        websiteUrl: blog4.body.websiteUrl,
                        createdAt: expect.any(String),
                        isMembership: false,
                        images: {
                            wallpaper: expect.any(Object),
                            main: expect.any(Array)
                        },
                        currentUserSubscriptionStatus: SubscriptionStatus.Unsubscribed,
                        subscribersCount: 1
                    }, {
                        id: expect.any(String),
                        name: blog3.name,
                        description: blog3.description,
                        websiteUrl: blog3.websiteUrl,
                        createdAt: expect.any(String),
                        isMembership: false,
                        images: {
                            wallpaper: expect.any(Object),
                            main: expect.any(Array)
                        },
                        currentUserSubscriptionStatus: SubscriptionStatus.Unsubscribed,
                        subscribersCount: 1
                    },
                    {
                        id: expect.any(String),
                        name: blog2.name,
                        description: blog2.description,
                        websiteUrl: blog2.websiteUrl,
                        createdAt: expect.any(String),
                        isMembership: false,
                        images: {
                            wallpaper: expect.any(Object),
                            main: expect.any(Array)
                        },
                        currentUserSubscriptionStatus: SubscriptionStatus.Subscribed,
                        subscribersCount: 2
                    },
                    {
                        id: expect.any(String),
                        name: blog1.name,
                        description: blog1.description,
                        websiteUrl: blog1.websiteUrl,
                        createdAt: expect.any(String),
                        isMembership: false,
                        images: {
                            wallpaper: expect.any(Object),
                            main: expect.any(Array)
                        },
                        currentUserSubscriptionStatus: SubscriptionStatus.Subscribed,
                        subscribersCount: 2
                    }
                    ]
                })

        })

    })
})