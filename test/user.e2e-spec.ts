import { userInputModel } from './../src/users/models/users-model';
import { appSettings } from './../src/app.settings';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest'
import { createUser } from './helpers/users-tests-helpers';
import { log } from 'console';


describe('tests for users', () => {
    let appController: AppController;
    let app: INestApplication;
    let httpServer: any;


    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            //controllers: [],
            //providers: []
        }).compile();

        //appController = app.get<AppController>(AppController);
        app = moduleFixture.createNestApplication()
        appSettings(app)
        await app.init()
        httpServer = app.getHttpServer()
        await request(httpServer).delete('/testing/all-data')

    })

    afterAll(async () => {
        await app.close()
    })



    describe('create user in the system ', () => {
        it('return user ', async () => {
            const creatResponse = await request(httpServer)
                .get('/sa/users')
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
                .expect(200)
            const getUsers = creatResponse.body
            expect(getUsers).toEqual({
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            })

        })

        it('error 404 is returned, there is no such user', async () => {
            await request(httpServer)
                .get('/sa/users/:5')
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
                .expect(404)
        })

        it('should return 401 status code', async () => {
            const model: userInputModel = {
                login: 'panda',
                password: 'panda2023',
                email: 'panda@mail.com',
            }
            const firstRes = await createUser('', '', model, httpServer)
            expect(firstRes.response.status).toBe(401)

            const secondRes = await createUser('any', 'any', model, httpServer)
            expect(secondRes.response.status).toBe(401)


        })
        it('создание первого пользователя', async () => {
            const model: userInputModel = {
                login: 'userOne',
                password: 'userOne2023',
                email: 'userOne@mail.com',
            }
            const thirdRes = await createUser('admin', 'qwerty', model, httpServer)
            const getUser = thirdRes.user
            expect(thirdRes.response.status).not.toBe(401)
            expect(thirdRes.response.status).not.toBe(500)
            expect(thirdRes.response.body).toEqual({
                id: getUser.id,
                login: model.login,
                email: model.email,
                createdAt: expect.any(String),
                banInfo: {
                    isBanned: false,
                    banDate: null,
                    banReason: null
                }
            })


            expect.setState({ userOne: getUser })
        }

        )

        it('should return 400 status code with errors', async () => {
            const errorsUsers = {
                errorsMessages: expect.arrayContaining([
                    {
                        field: 'login',
                        message: expect.any(String)
                    },
                    {
                        field: 'password',
                        message: expect.any(String)
                    },
                    {
                        field: 'email',
                        message: expect.any(String)
                    }
                ])
            }
            const modelOne: userInputModel = {
                login: '',
                password: '',
                email: '',
            }
            const firstRes = await createUser('admin', 'qwerty', modelOne, httpServer)
            expect(firstRes.response.status).toBe(400)
            expect(firstRes.user).toEqual(errorsUsers)

            const modelTwo: userInputModel = {
                login: '12',
                password: '123456',
                email: 'sdvsdv@mail.ru',
            }
            const errorsUsersTwo = {
                errorsMessages: expect.arrayContaining([
                    {
                        field: 'login',
                        message: expect.any(String)
                    }
                ])
            }
            const twoRes = await createUser('admin', 'qwerty', modelTwo, httpServer)
            expect(twoRes.response.status).toBe(400)
            expect(twoRes.user).toEqual(errorsUsersTwo)

            const modelFree: userInputModel = {
                login: '123456',
                password: '123456',
                email: 'sdvsdvmail.ru',
            }
            const errorsUsersFree = {
                errorsMessages: expect.arrayContaining([
                    {
                        field: 'email',
                        message: expect.any(String)
                    }
                ])
            }
            const freeRes = await createUser('admin', 'qwerty', modelFree, httpServer)
            expect(freeRes.response.status).toBe(400)
            expect(freeRes.user).toEqual(errorsUsersFree)


        })

        it('создание вторго пользователя', async () => {
            const modelTwo: userInputModel = {
                login: 'userTwo',
                password: 'userTwo2023',
                email: 'userTwo@mail.com',
            }
            const res = await createUser('admin', 'qwerty', modelTwo, httpServer)
            const getUserTwo = res.user
            expect(res.response.status).not.toBe(401)
            expect(res.response.status).not.toBe(500)
            expect(res.response.body).toEqual({
                id: res.user.id,
                login: modelTwo.login,
                email: modelTwo.email,
                createdAt: expect.any(String),
                banInfo: {
                    isBanned: false,
                    banDate: null,
                    banReason: null
                }
            })

            expect.setState({ userTwo: getUserTwo })
        })

        it('создание третьего пользователя', async () => {
            const modelThree: userInputModel = {
                login: 'userThree',
                password: 'userThree2023',
                email: 'userThree@mail.com',
            }
            const res = await createUser('admin', 'qwerty', modelThree, httpServer)
            const getUserThree = res.user
            expect(res.response.status).not.toBe(401)
            expect(res.response.status).not.toBe(500)
            expect(res.response.body).toEqual({
                id: res.user.id,
                login: modelThree.login,
                email: modelThree.email,
                createdAt: expect.any(String),
                banInfo: {
                    isBanned: false,
                    banDate: null,
                    banReason: null
                }
            })

            expect.setState({ userThree: getUserThree })
        })


        it('заппрос всех трех пользователей ', async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userThree } = expect.getState()


            const res = await request(httpServer).get(`/sa/users`)
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            expect(res.status).toBe(200)
            expect(res.body).toEqual({
                pagesCount: expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: 3,
                items: [userThree, userTwo, userOne]
            })
        })

        it('фильтрация и пагинация по email и login', async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userThree } = expect.getState()


            const res = await request(httpServer).get(`/sa/users?pageSize=15&pageNumber=1&searchLoginTerm=Th&searchEmailTerm=ee&sortDirection=asc&sortBy=login`)
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            expect(res.status).toBe(200)
            expect(res.body).toEqual({
                pagesCount: expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: 1,
                items: [userThree]
            })
        })


        it('забанить третьего пользователя', async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userThree } = expect.getState()


            const res = await request(httpServer).put(`/sa/users/${userThree.id}/ban`)
                .send({
                    isBanned: 'true',
                    banReason: Math.random().toString(36).slice(6, 21)
                })
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            expect(res.status).toBe(400)
            expect(res.body).toEqual({
                errorsMessages: [
                    {
                        message: expect.any(String),
                        field: "isBanned"
                    }
                ]
            })


            const res2 = await request(httpServer).put(`/sa/users/${userThree.id}/ban`)
                .send({
                    isBanned: true,
                    banReason: Math.random().toString(36).slice(21, 24)
                })
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            expect(res2.status).toBe(400)
            expect(res2.body).toEqual({
                errorsMessages: [
                    {
                        message: expect.any(String),
                        field: "banReason"
                    }
                ]
            })

            const res3 = await request(httpServer).put(`/sa/users/${userThree.id}/ban`)
                .send({
                    isBanned: true,
                    banReason: Math.random().toString(36).slice(6, 21)
                })
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            expect(res3.status).toBe(204)

        })


        it('запрещенный пользователь не должен входить в систему', async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userThree } = expect.getState()
            const modelThree: userInputModel = {
                login: 'userThree',
                password: 'userThree2023',
                email: 'userThree@mail.com',
            }
            const res3 = await request(httpServer).post(`/auth/login`)
                .send({
                    loginOrEmail: modelThree.login,
                    password: modelThree.password
                })
            expect(res3.status).toBe(401)

        })


        it('фильтрация и пагинация поиск забанненого пользователя', async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userThree } = expect.getState()


            const res = await request(httpServer).get(`/sa/users?pageSize=15&pageNumber=1&sortDirection=asc&banStatus=banned`)
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            expect(res.status).toBe(200)
            expect(res.body).toEqual({
                pagesCount: expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: 1,
                items: [{
                    id: userThree.id,
                    login: userThree.login,
                    email: userThree.email,
                    createdAt: expect.any(String),
                    banInfo: {
                        isBanned: true,
                        banDate: expect.any(String),
                        banReason: expect.any(String)
                    }
                }]
            })
        })


        it('фильтрация и пагинация поиск незабаненных пользователей', async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userThree } = expect.getState()


            const res = await request(httpServer).get(`/sa/users?pageSize=15&pageNumber=1&sortDirection=asc&banStatus=notBanned`)
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            expect(res.status).toBe(200)
            expect(res.body).toEqual({
                pagesCount: expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: 2,
                items: [{
                    id: userOne.id,
                    login: userOne.login,
                    email: userOne.email,
                    createdAt: expect.any(String),
                    banInfo: {
                        isBanned: false,
                        banDate: null,
                        banReason: null
                    }
                },
                {
                    id: userTwo.id,
                    login: userTwo.login,
                    email: userTwo.email,
                    createdAt: expect.any(String),
                    banInfo: {
                        isBanned: false,
                        banDate: null,
                        banReason: null
                    }
                }]
            })
        })

        it('фильтрация и пагинация поиск всех (незабаненных и забаненных) пользователей', async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userThree } = expect.getState()


            const res = await request(httpServer).get(`/sa/users?pageSize=15&pageNumber=1&sortDirection=asc&banStatus=all`)
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            expect(res.status).toBe(200)
            expect(res.body).toEqual({
                pagesCount: expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: 3,
                items: [{
                    id: userOne.id,
                    login: userOne.login,
                    email: userOne.email,
                    createdAt: expect.any(String),
                    banInfo: {
                        isBanned: false,
                        banDate: null,
                        banReason: null
                    }
                },
                {
                    id: userTwo.id,
                    login: userTwo.login,
                    email: userTwo.email,
                    createdAt: expect.any(String),
                    banInfo: {
                        isBanned: false,
                        banDate: null,
                        banReason: null
                    }
                },
                {
                    id: userThree.id,
                    login: userThree.login,
                    email: userThree.email,
                    createdAt: expect.any(String),
                    banInfo: {
                        isBanned: true,
                        banDate: expect.any(String),
                        banReason: expect.any(String)
                    }
                }
             ]
            })
        })

        it('разбанить третьего пользователя и проверка возможности авторизации', async () => {
            const { userThree } = expect.getState()


            const res3 = await request(httpServer).put(`/sa/users/${userThree.id}/ban`)
                .send({
                    isBanned: false,
                    banReason: Math.random().toString(36).slice(6, 21)
                })
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            expect(res3.status).toBe(204)

            const modelThree: userInputModel = {
                login: 'userThree',
                password: 'userThree2023',
                email: 'userThree@mail.com',
            }
            const res4 = await request(httpServer).post(`/auth/login`)
                .send({
                    loginOrEmail: modelThree.login,
                    password: modelThree.password
                })
            expect(res4.status).toBe(200)


        })

        it('delete userId ', async () => {
            const { userOne } = expect.getState()
            const { userTwo } = expect.getState()
            const { userThree } = expect.getState()

            const res = await request(httpServer).delete(`/sa/users/${userOne.id}`)
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            expect(res.status).toBe(204)

            const resTwo = await request(httpServer).get(`/sa/users`)
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            expect(resTwo.status).toBe(200)
            expect(resTwo.body).toEqual({
                pagesCount: expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: expect.any(Number),
                items: expect.any(Array)
            })
        })


    })
})