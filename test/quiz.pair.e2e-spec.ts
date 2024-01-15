import jwt from 'jsonwebtoken';
import { userInputModel } from './../src/users/models/users-model';
import { appSettings } from './../src/app.settings';
import { AppModule } from '../src/app.module';
import { AppController } from '../src/app.controller';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest'
import exp from 'constants';
import { createUser } from './helpers/users-tests-helpers';
import { settings } from '../src/settings';
import { uuid } from 'uuidv4';


describe('tests for questions', () => {
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



    describe('Возвращает текущую незавершенную пользовательскую игру my-current', () => {
        it('Возвращает статус 404', async () => {
            const model: userInputModel = {
                login: 'userThree',
                password: 'userThree2023',
                email: 'userFree@mail.com',
            }

            const user = await createUser('admin', 'qwerty', model, httpServer)
            expect.setState({ userThree: user.user })

            const creatResponse = await request(httpServer)
                .get('/pair-game-quiz/pairs/my-current')
                .set(user.headers)
                .expect(404)
        })

        it('Возвращает статус 401', async () => {

            const creatResponse = await request(httpServer)
                .get('/pair-game-quiz/pairs/my-current')
                .expect(401)
        })

        it('Подключаемся к своей игре', async () => {
            const { userThree } = expect.getState()
            const AccessToken = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const creatPair = await request(httpServer)
                .post('/pair-game-quiz/pairs/connection')
                .set(headersJWT)
                .expect(200)

            expect(creatPair.body).toEqual({
                id: expect.any(String),
                firstPlayerProgress: {
                    answers: expect.any(Array),
                    player: {
                        id: userThree.id,
                        login: userThree.login
                    },
                    score: 0
                },
                secondPlayerProgress: null,
                questions: null,
                status: 'PendingSecondPlayer',
                pairCreatedDate: expect.any(String),
                startGameDate: null,
                finishGameDate: null
            }
            )

            expect.setState({ pairOne: creatPair.body })


            const connectMuCorrent = await request(httpServer)
                .get('/pair-game-quiz/pairs/my-current')
                .set(headersJWT)
                .expect(200)

            expect(connectMuCorrent.body).toEqual({
                id: expect.any(String),
                firstPlayerProgress: {
                    answers: expect.any(Array),
                    player: {
                        id: userThree.id,
                        login: userThree.login
                    },
                    score: 0
                },
                secondPlayerProgress: null,
                questions: null,
                status: 'PendingSecondPlayer',
                pairCreatedDate: expect.any(String),
                startGameDate: null,
                finishGameDate: null
            }
            )
        })



    })

    describe('Возвращает игру по id', () => {

        it('Возвращает статус 401', async () => {
            const creatResponse = await request(httpServer)
                .get('/pair-game-quiz/pairs/123')
                .expect(401)
        })

        it('Возвращает стату 404', async () => {
            const { userThree } = expect.getState()


            const AccessToken = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }
            const uuidParams = uuid()
            const creatResponseTwo = await request(httpServer)
                .get(`/pair-game-quiz/pairs/${uuidParams}`)
                .set(headersJWT)
                .expect(404)
        })

        it('Возвращает стату 400, ID имеет недопустимый формат', async () => {
            const { userThree } = expect.getState()


            const AccessToken = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }
            const creatResponseTwo = await request(httpServer)
                .get(`/pair-game-quiz/pairs/123`)
                .set(headersJWT)
                .expect(400)
            expect(creatResponseTwo.body).toEqual(
                {
                    "errorsMessages": [
                        {
                            "message": expect.any(String),
                            "field": expect.any(String)
                        }
                    ]
                }
            )

        })

        it('Возвращает 403', async () => {
            const { pairOne } = expect.getState()
            const model: userInputModel = {
                login: 'userOne',
                password: 'userOne2023',
                email: 'userOne@mail.com',
            }

            const user = await createUser('admin', 'qwerty', model, httpServer)

            expect.setState({ userOne: user.user })


            const AccessToken = jwt.sign({ userId: user.user.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const creatResponse = await request(httpServer)
                .get(`/pair-game-quiz/pairs/${pairOne.id}`)
                .set(headersJWT)
                .expect(403)


        })


        it('Возвращает игру', async () => {
            const { userThree } = expect.getState()
            const { pairOne } = expect.getState()

            const AccessToken = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const creatResponse = await request(httpServer)
                .get(`/pair-game-quiz/pairs/${pairOne.id}`)
                .set(headersJWT)
                .expect(200)

            expect(creatResponse.body).toEqual({
                id: expect.any(String),
                firstPlayerProgress: {
                    answers: expect.any(Array),
                    player: {
                        id: userThree.id,
                        login: userThree.login
                    },
                    score: 0
                },
                secondPlayerProgress: null,
                questions: null,
                status: 'PendingSecondPlayer',
                pairCreatedDate: expect.any(String),
                startGameDate: null,
                finishGameDate: null
            })

        })

    })

    describe('Подключить текущего пользователя к существующей случайной паре или создайте новую пару - connection,', () => {

        it('Возвращает статус 401', async () => {

            const creatResponse = await request(httpServer)
                .post('/pair-game-quiz/pairs/connection')
                .expect(401)
        })

        it('Возвращает 403 статус при connection повторно первого пользователя', async () => {
            const { userThree } = expect.getState()

            const AccessToken = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const creatResponse = await request(httpServer)
                .post('/pair-game-quiz/pairs/connection')
                .set(headersJWT)
                .expect(403)
        })

        it('Подключение второго игрока к паре', async () => {
            const { userThree } = expect.getState()

            const model: userInputModel = {
                login: 'userFour',
                password: 'userFour',
                email: 'userFour@mail.com',
            }

            const userFour = await createUser('admin', 'qwerty', model, httpServer)
            const AccessToken = jwt.sign({ userId: userFour.user.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            expect.setState({ userFour: userFour.user })

            const creatNewPair = await request(httpServer)
                .post('/pair-game-quiz/pairs/connection')
                .set(headersJWT)
                .expect(200)


            expect(creatNewPair.body).toEqual({
                id: expect.any(String),
                firstPlayerProgress: {
                    answers: expect.any(Array),
                    player: {
                        id: userThree.id,
                        login: userThree.login
                    },
                    score: 0
                },
                secondPlayerProgress: {
                    answers: expect.any(Array),
                    player: {
                        id: userFour.user.id,
                        login: userFour.user.login
                    },
                    score: 0
                },
                questions: expect.any(Array),
                status: 'Active',
                pairCreatedDate: expect.any(String),
                startGameDate: expect.any(String),
                finishGameDate: null
            })
        })

        it('Возвращает текущую незавершенную пользовательскую игру от первого пользователя', async () => {
            const { userThree } = expect.getState()
            const { userFour } = expect.getState()

            const AccessToken = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }
            
            const connectMuCorrent = await request(httpServer)
                .get('/pair-game-quiz/pairs/my-current')
                .set(headersJWT)
                .expect(200)

            expect(connectMuCorrent.body).toEqual({
                id: expect.any(String),
                firstPlayerProgress: {
                    answers: expect.any(Array),
                    player: {
                        id: userThree.id,
                        login: userThree.login
                    },
                    score: 0
                },
                secondPlayerProgress: {
                    answers: expect.any(Array),
                    player: {
                        id: userFour.id,
                        login: userFour.login
                    },
                    score: 0
                },
                questions: expect.any(Array),
                status: 'Active',
                pairCreatedDate: expect.any(String),
                startGameDate: expect.any(String),
                finishGameDate: null
            }
            )

        })

        it('Возвращает текущую незавершенную пользовательскую игру от второго пользователя', async () => {
            const { userThree } = expect.getState()
            const { userFour } = expect.getState()

            const AccessToken = jwt.sign({ userId: userFour.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }
            
            const connectMuCorrent = await request(httpServer)
                .get('/pair-game-quiz/pairs/my-current')
                .set(headersJWT)
                .expect(200)

            expect(connectMuCorrent.body).toEqual({
                id: expect.any(String),
                firstPlayerProgress: {
                    answers: expect.any(Array),
                    player: {
                        id: userThree.id,
                        login: userThree.login
                    },
                    score: 0
                },
                secondPlayerProgress: {
                    answers: expect.any(Array),
                    player: {
                        id: userFour.id,
                        login: userFour.login
                    },
                    score: 0
                },
                questions: expect.any(Array),
                status: 'Active',
                pairCreatedDate: expect.any(String),
                startGameDate: expect.any(String),
                finishGameDate: null
            }
            )

        })

        it('Возвращает игру по id от первого пользователя', async () => {
            const { userThree } = expect.getState()
            const { userFour } = expect.getState()

            const { pairOne } = expect.getState()

            const AccessToken = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const creatResponse = await request(httpServer)
                .get(`/pair-game-quiz/pairs/${pairOne.id}`)
                .set(headersJWT)
                .expect(200)

        })


        it('Возвращает 403 статус при connection повторно второго пользователя', async () => {
            const { userFour } = expect.getState()


            const AccessToken = jwt.sign({ userId: userFour.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const creatResponse = await request(httpServer)
                .post('/pair-game-quiz/pairs/connection')
                .set(headersJWT)
                .expect(403)
        })


        it('Подключение третьего игрока, создание новой пары', async () => {

            const model: userInputModel = {
                login: 'userFive',
                password: 'userFive',
                email: 'userFive@mail.com',
            }

            const userFive = await createUser('admin', 'qwerty', model, httpServer)
            const AccessToken = jwt.sign({ userId: userFive.user.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            expect.setState({ userFive: userFive.user })

            const creatNewPair = await request(httpServer)
                .post('/pair-game-quiz/pairs/connection')
                .set(headersJWT)
                .expect(200)

            expect(creatNewPair.body).toEqual({
                id: expect.any(String),
                firstPlayerProgress: {
                    answers: expect.any(Array),
                    player: {
                        id: userFive.user.id,
                        login: userFive.user.login
                    },
                    score: 0
                },
                secondPlayerProgress: null,
                questions: null,
                status: 'PendingSecondPlayer',
                pairCreatedDate: expect.any(String),
                startGameDate: null,
                finishGameDate: null
            })
        })



    })



})
