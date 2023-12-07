import { appSettings } from './../src/app.settings';
import { userInputModel } from './../users/models/users-model';
import { AppModule } from './../src/app.module';
import { AppController } from './../src/app.controller';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest'
import { createUser } from './helpers/users-tests-helpers';
import { log } from 'console';


describe('AppController', () => {
    let appController: AppController;
    let app: INestApplication;
    let httpServer: any;
  
  
    beforeEach(async () => {
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
        it ('return user ', async () => {
            const creatResponse = await request(httpServer)
                .get('/users')
                .set({Authorization: 'Basic YWRtaW46cXdlcnR5'})
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
                    .get('/users/:5')
                    .set({Authorization: 'Basic YWRtaW46cXdlcnR5'})
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

            const thirdRes = await createUser('admin', 'qwerty', model, httpServer)
            const getUser = thirdRes.user

            expect(thirdRes.response.status).not.toBe(401)
            
            expect.setState({user: getUser})
        })

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


        it ('should return 200 status code and created user', async () => {
            const {user} = expect.getState()
            const res = await request(httpServer).get(`/users`)
                                          .set({Authorization: 'Basic YWRtaW46cXdlcnR5'})

            expect(res.status).toBe(200)
            expect(res.body).toEqual({pagesCount: expect.any(Number),
                                      page: expect.any(Number),
                                      pageSize: expect.any(Number),
                                      totalCount: expect.any(Number),
                                      items: [user]
            })
        })
        
        it ('delete userId ', async () => {
        const {user} = expect.getState()

        const res = await request(httpServer).delete(`/users/${user.id}`)
                                      .set({Authorization: 'Basic YWRtaW46cXdlcnR5'})
        expect(res.status).toBe(204)
        const resTwo = await request(httpServer).get(`/users`)
                                          .set({Authorization: 'Basic YWRtaW46cXdlcnR5'})
        expect(resTwo.status).toBe(200)
        expect(resTwo.body).toEqual({pagesCount: expect.any(Number),
            page: expect.any(Number),
            pageSize: expect.any(Number),
            totalCount: expect.any(Number),
            items: []
        })                   
    })
})
})