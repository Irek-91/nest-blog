import { createFiveQuestions } from './helpers/qustions-tests-helpers';
import { sendAnswerOneByUser } from './helpers/answers-tests-helpers';
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

    describe('Создаем вопросы для тестирования', () => {
        it('Создали 5 вопросов ', async () => {

            const created = await createFiveQuestions('admin', 'qwerty', httpServer)
        })


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

        it('Возвращает 403 статус при connection повторно первого(userThree) пользователя', async () => {
            const { userThree } = expect.getState()

            const AccessToken = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const creatResponse = await request(httpServer)
                .post('/pair-game-quiz/pairs/connection')
                .set(headersJWT)
                .expect(403)
        })

        it('Подключение второго(userFour) игрока к паре', async () => {
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

        it('Возвращает текущую незавершенную пользовательскую игру от первого(userThree) пользователя', async () => {
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

        it('Возвращает текущую незавершенную пользовательскую игру от второго(userFour) пользователя', async () => {
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

        it('Возвращает игру по id от первого(userThree) пользователя', async () => {
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


        it('Возвращает 403 статус при connection повторно второго(userFour) пользователя', async () => {
            const { userFour } = expect.getState()


            const AccessToken = jwt.sign({ userId: userFour.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const creatResponse = await request(httpServer)
                .post('/pair-game-quiz/pairs/connection')
                .set(headersJWT)
                .expect(403)
        })

        it(`Возвращает статус 201, после ответов первого(userThree) и  второго (userFour)
         пользователя, победа первого(userThree) и бонус у второго(userFour)`, async () => {
            const { userThree } = expect.getState()
            const { userFour } = expect.getState()

            const inputData = {
                answer: "первый"
            }
            const inputIncorrectData = {
                answer: "второй"
            }

            const answeruserThree1 = await sendAnswerOneByUser(userThree, inputData, httpServer)
            const answeruserFour1 = await sendAnswerOneByUser(userFour, inputData, httpServer)

            const answeruserThree2 = await sendAnswerOneByUser(userThree, inputIncorrectData, httpServer)
            const answeruserFour2 = await sendAnswerOneByUser(userFour, inputIncorrectData, httpServer)

            const answeruserThree3 = await sendAnswerOneByUser(userThree, inputData, httpServer)
            const answeruserFour3 = await sendAnswerOneByUser(userFour, inputIncorrectData, httpServer)

            const answeruserThree4 = await sendAnswerOneByUser(userThree, inputData, httpServer)
            const answeruserFour4 = await sendAnswerOneByUser(userFour, inputIncorrectData, httpServer)

            const answeruserThree5 = await sendAnswerOneByUser(userFour, inputIncorrectData, httpServer)
            const answeruserFour5 = await sendAnswerOneByUser(userThree, inputIncorrectData, httpServer)

        })


        it('Подключение третьего(userFive) игрока, создание новой пары', async () => {

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

        it('Подключение первого(userThree) игрока к игре с третьим(userFive) игроком', async () => {
            const { userThree } = expect.getState()
            const { userFive } = expect.getState()

            const AccessToken = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const connectionPair = await request(httpServer)
                .post('/pair-game-quiz/pairs/connection')
                .set(headersJWT)
                .expect(200)

            expect(connectionPair.body).toEqual({
                id: expect.any(String),
                firstPlayerProgress: {
                    answers: expect.any(Array),
                    player: {
                        id: userFive.id,
                        login: userFive.login
                    },
                    score: 0
                },
                secondPlayerProgress: {
                    answers: expect.any(Array),
                    player: {
                        id: userThree.id,
                        login: userThree.login
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

        it(`Игра первого(userThree) игрока с третьим(userFive) игроком, результат ничья, 
        ,бонус у третьего (userFive)`, async () => {
            const { userThree } = expect.getState()
            const { userFive } = expect.getState()

            const inputData = {
                answer: "первый"
            }
            const inputIncorrectData = {
                answer: "второй"
            }

            const resultAnswer6 = await sendAnswerOneByUser(userThree, inputData, httpServer)
            const resultAnswer1 = await sendAnswerOneByUser(userFive, inputData, httpServer)

            const resultAnswer7 = await sendAnswerOneByUser(userThree, inputData, httpServer)
            const resultAnswer2 = await sendAnswerOneByUser(userFive, inputData, httpServer)

            const resultAnswer8 = await sendAnswerOneByUser(userThree, inputData, httpServer)
            const resultAnswer3 = await sendAnswerOneByUser(userFive, inputData, httpServer)


            const resultAnswer9 = await sendAnswerOneByUser(userThree, inputData, httpServer)
            const resultAnswer4 = await sendAnswerOneByUser(userFive, inputData, httpServer)

            const resultAnswer5 = await sendAnswerOneByUser(userFive, inputIncorrectData, httpServer)
            const resultAnswer10 = await sendAnswerOneByUser(userThree, inputData, httpServer)


        })




    })

    describe('Возвращаем все игры пользователя, /pair-game-quiz/pairs/my', () => {

        it('Возвращает статус 401', async () => {

            const creatResponse = await request(httpServer)
                .get('/pair-game-quiz/pairs/my')
                .expect(401)
        })
        it('Возвращаем пустой массив, пользователь который не играл', async () => {
            const model: userInputModel = {
                login: 'userSix',
                password: 'userSix2023',
                email: 'userSix@mail.com',
            }

            const user = await createUser('admin', 'qwerty', model, httpServer)
            expect.setState({ userSix: user.user })

            const creatResponse = await request(httpServer)
                .get('/pair-game-quiz/pairs/my')
                .set(user.headers)
                .expect(200)
            expect(creatResponse.body).toEqual(
                {
                    pagesCount: expect.any(Number),
                    page: 1,
                    pageSize: 10,
                    totalCount: expect.any(Number),
                    items: []
                }
            )
        })
        it('Возвращаем игры, пользователя (userThree)', async () => {
            const { userThree } = expect.getState()


            const AccessToken = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const creatResponse = await request(httpServer)
                .get('/pair-game-quiz/pairs/my')
                .set(headersJWT)
                .expect(200)
            expect(creatResponse.body).toEqual(
                {
                    pagesCount: expect.any(Number),
                    page: 1,
                    pageSize: 10,
                    totalCount: 2,
                    items: [
                        {
                            id: expect.any(String),
                            firstPlayerProgress: {
                                answers: expect.any(Array),
                                player: {
                                    id: expect.any(String),
                                    login: expect.any(String)
                                },
                                score: 5
                            },
                            secondPlayerProgress: {
                                answers: expect.any(Array),
                                player: {
                                    id: userThree.id,
                                    login: userThree.login
                                },
                                score: 5
                            },
                            questions: expect.any(Array),
                            status: "Finished",
                            pairCreatedDate: expect.any(String),
                            startGameDate: expect.any(String),
                            finishGameDate: expect.any(String)
                        },
                        {
                            id: expect.any(String),
                            firstPlayerProgress: {
                                answers: expect.any(Array),
                                player: {
                                    id: userThree.id,
                                    login: userThree.login
                                },
                                score: 3
                            },
                            secondPlayerProgress: {
                                answers: expect.any(Array),
                                player: {
                                    id: expect.any(String),
                                    login: expect.any(String)
                                },
                                score: 2
                            },
                            questions: expect.any(Array),
                            status: "Finished",
                            pairCreatedDate: expect.any(String),
                            startGameDate: expect.any(String),
                            finishGameDate: expect.any(String)
                        }
                    ]
                }
            )
        })



    })


    describe('Возвращаем статистику /pair-game-quiz/users/my-statistic', () => {

        it('Возвращает статус 401', async () => {

            const creatResponse = await request(httpServer)
                .get('/pair-game-quiz/users/my-statistic')
                .expect(401)
        })

        it('Возвращаем статистику, пользователя (userThree)', async () => {
            const { userThree } = expect.getState()


            const AccessToken = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const creatResponse = await request(httpServer)
                .get('/pair-game-quiz/users/my-statistic')
                .set(headersJWT)
                .expect(200)
            expect(creatResponse.body).toEqual(
                {
                    sumScore: 8,
                    avgScores: 4,
                    gamesCount: 2,
                    winsCount: 1,
                    lossesCount: 0,
                    drawsCount: 1
                }
            )
        })

        it('Возвращаем статистику, пользователя (userFour)', async () => {
            const { userFour } = expect.getState()



            const AccessToken = jwt.sign({ userId: userFour.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const creatResponse = await request(httpServer)
                .get('/pair-game-quiz/users/my-statistic')
                .set(headersJWT)
                .expect(200)
            expect(creatResponse.body).toEqual(
                {
                    sumScore: 2,
                    avgScores: 2,
                    gamesCount: 1,
                    winsCount: 0,
                    lossesCount: 1,
                    drawsCount: 0
                }
            )
        })

        it('Возвращаем статистику, пользователя (userFive)', async () => {
            const { userFive } = expect.getState()



            const AccessToken = jwt.sign({ userId: userFive.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWT = { Authorization: `Bearer ${AccessToken}` }

            const creatResponse = await request(httpServer)
                .get('/pair-game-quiz/users/my-statistic')
                .set(headersJWT)
                .expect(200)
            expect(creatResponse.body).toEqual(
                {
                    sumScore: 5,
                    avgScores: 5,
                    gamesCount: 1,
                    winsCount: 0,
                    lossesCount: 0,
                    drawsCount: 1
                }
            )
        })


    })


    describe('Возвращаем статистику TOP /pair-game-quiz/users/top', () => {

        it('Возвращает статус 200', async () => {
            const { userThree } = expect.getState()
            const { userFour } = expect.getState()
            const { userFive } = expect.getState()


            const creatResponse = await request(httpServer)
                .get('/pair-game-quiz/users/top?pageSize=3&pageNumber=1&sort=avgScores desc')
                .expect(200)
            expect(creatResponse.body).toEqual(
                {
                    pagesCount: 1,
                    page: 1,
                    pageSize: 3,
                    totalCount: 3,
                    items: [
                        {
                            sumScore: 5,
                            avgScores: 5,
                            gamesCount: 1,
                            winsCount: 0,
                            lossesCount: 0,
                            drawsCount: 1,
                            player: {
                                id: userFive.id,
                                login: userFive.login
                              }
                        },
                        {
                            sumScore: 8,
                            avgScores: 4,
                            gamesCount: 2,
                            winsCount: 1,
                            lossesCount: 0,
                            drawsCount: 1,
                            player: {
                                id: userThree.id,
                                login: userThree.login
                              }
                        }
                        ,
                        {
                            sumScore: 2,
                            avgScores: 2,
                            gamesCount: 1,
                            winsCount: 0,
                            lossesCount: 1,
                            drawsCount: 0,
                            player: {
                                id: userFour.id,
                                login: userFour.login
                              }
                        }
                    ]
                }
            )
        })
    })

    describe('тестируем окончание игры, после 10 секунд', ()=> {
        it( 'Создаем новуб пару с userThree',async ()=> {
            const { userThree } = expect.getState()
            const { userFour } = expect.getState()
            const { userFive } = expect.getState()
            
            const AccessTokenUserThree = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWTuserThree = { Authorization: `Bearer ${AccessTokenUserThree}` }

            const creatNewPair = await request(httpServer)
                .post('/pair-game-quiz/pairs/connection')
                .set(headersJWTuserThree)
                .expect(200)
        })
        it( 'Подключаемся к userThree игроком userFive',async ()=> {
            const { userThree } = expect.getState()
            const { userFour } = expect.getState()
            const { userFive } = expect.getState()
            
            const AccessTokenUserFive = jwt.sign({ userId: userFive.id }, settings.JWT_SECRET, { expiresIn: 100 })
            const headersJWTuserFive = { Authorization: `Bearer ${AccessTokenUserFive}` }

            const creatNewPair = await request(httpServer)
                .post('/pair-game-quiz/pairs/connection')
                .set(headersJWTuserFive)
                .expect(200)
        })

        it(`Начинаем отвечать, игрок userThree отвечает первым на 5 вопросов,
         игрок  userFive только на один`, async () => {
            const { userThree } = expect.getState()
            const { userFive } = expect.getState()

            const inputData = {
                answer: "первый"
            }
         

            const resultAnswer6 = await sendAnswerOneByUser(userThree, inputData, httpServer)
            const resultAnswer1 = await sendAnswerOneByUser(userFive, inputData, httpServer)

            const resultAnswer7 = await sendAnswerOneByUser(userThree, inputData, httpServer)

            const resultAnswer8 = await sendAnswerOneByUser(userThree, inputData, httpServer)


            const resultAnswer9 = await sendAnswerOneByUser(userThree, inputData, httpServer)

            const resultAnswer10 = await sendAnswerOneByUser(userThree, inputData, httpServer)

        })

        it('Проверем мою игру через 10 секунд, должен вернуть 404', async ()=> {
            setTimeout(async ()=> {
                const { userThree } = expect.getState()

                const AccessToken = jwt.sign({ userId: userThree.id }, settings.JWT_SECRET, { expiresIn: 100 })
                const headersJWT = { Authorization: `Bearer ${AccessToken}` }
    
                const connectMuCorrent = await request(httpServer)
                    .get('/pair-game-quiz/pairs/my-current')
                    .set(headersJWT)
                    .expect(404)
            }, 10000)
        })

    })

})
