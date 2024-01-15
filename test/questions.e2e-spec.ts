import { createQuestions } from './helpers/qustions-tests-helpers';
import { QuestionInputModel } from '../src/quiz.questions/model/questionModel';
import { appSettings } from '../src/app.settings';
import { AppModule } from '../src/app.module';
import { AppController } from '../src/app.controller';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest'
import exp from 'constants';


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



    describe('create question in the system ', () => {
        it('return questions ', async () => {
            const creatResponse = await request(httpServer)
                .get('/sa/quiz/questions')
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
        })
        it('error 401 is returned, there is Unauthorized', async () => {
            await request(httpServer)
                .get('/sa/quiz/questions')
                .expect(401)
        })


        it('should return 400 status code with errors', async () => {
            const errorsQuestions = {
                errorsMessages: expect.arrayContaining([
                    {
                        field: 'body',
                        message: expect.any(String)
                    },
                    {
                        field: 'correctAnswers',
                        message: expect.any(String)
                    }
                ])
            }
            const modelOne = {
                body: '',
                correctAnswers: ''
            }

            const firstRes = await request(httpServer)
                .post('/sa/quiz/questions')
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
                .send(modelOne)

            expect(firstRes.status).toBe(400)
            expect(firstRes.body).toEqual(errorsQuestions)
        })

        it('should return 201 status created question', async () => {

            const modelOne = {
                body: 'Сколько будет 5+5?',
                correctAnswers: ['десять', '10']
            }

            const firstRes = await createQuestions('admin', 'qwerty', modelOne, httpServer)
            const questionFirst = firstRes.question
            expect(firstRes.response.status).toBe(201)
            expect(questionFirst).toEqual({
                id: expect.any(String),
                body: modelOne.body,
                correctAnswers: modelOne.correctAnswers,
                published: false,
                createdAt: expect.any(String),
                updatedAt: null
            })

            expect.setState({ questionFirst: questionFirst })
        })

        
        it('обновление вопроса по id', async () => {
            const { questionFirst } = expect.getState()

            const updateDataOne = {
                body: 'Сколько будет 6+6?',
                correctAnswers: ['12', 'двенадцать']
            }
            const updateResponse = await request(httpServer)
                .put(`/sa/quiz/questions/${questionFirst.id}`)
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
                .send(updateDataOne)
                .expect(204)


            const getQuestionsResponse = await request(httpServer)
                .get('/sa/quiz/questions')
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
                .expect(200)

            const getQuestions = getQuestionsResponse.body
            expect(getQuestions).toEqual({
                pagesCount: expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: expect.any(Number),
                items: [
                    {
                        id: expect.any(String),
                        body: updateDataOne.body,
                        correctAnswers: updateDataOne.correctAnswers,
                        published: false,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String)
                    }
                ]
            })
        })

        it('обновление статуса публикации вопроса, по id', async () => {
            const { questionFirst } = expect.getState()
            const errorsQuestions = {
                errorsMessages: expect.arrayContaining([
                    {
                        field: 'published',
                        message: expect.any(String)
                    }
                ])
            }

            const updateDataIncorect = {
                published: 'true',
            }

            const updateOne = await request(httpServer)
            .put(`/sa/quiz/questions/${questionFirst.id}/publish`)
            .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
            .send(updateDataIncorect)
            .expect(400)
            
            expect(updateOne.body).toEqual(errorsQuestions)




            const updateDataOne = {
                published: true,
            }

            const updateResponse = await request(httpServer)
                .put(`/sa/quiz/questions/${questionFirst.id}/publish`)
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
                .send(updateDataOne)
                .expect(204)


            const getQuestionsResponse = await request(httpServer)
                .get('/sa/quiz/questions')
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
                .expect(200)

            const getQuestions = getQuestionsResponse.body
            expect(getQuestions).toEqual({
                pagesCount: expect.any(Number),
                page: expect.any(Number),
                pageSize: expect.any(Number),
                totalCount: expect.any(Number),
                items: [
                    {
                        id: expect.any(String),
                        body: expect.any(String),
                        correctAnswers: expect.any(Array),
                        published: true,
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String)
                    }
                ]
            })



        })

        it('удаленеи вопроса по id', async () => {

            const { questionFirst } = expect.getState()
            const firstRes = await request(httpServer)
                .delete(`/sa/quiz/questions/${questionFirst.id}`)
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })

            expect(firstRes.status).toBe(204)

            const creatResponse = await request(httpServer)
                .get('/sa/quiz/questions')
                .set({ Authorization: 'Basic YWRtaW46cXdlcnR5' })
                .expect(200)
            const getQuestions = creatResponse.body
            expect(getQuestions).toEqual({
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            })

        })


    })