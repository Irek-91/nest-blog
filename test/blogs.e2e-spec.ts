import request from 'supertest'
import { log } from 'console';
import { Test, TestingModule } from '@nestjs/testing';
import { NestFactory } from '@nestjs/core'
import { INestApplication} from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/app.settings';
import { blogInput } from '../src/blogs/models/blogs-model';
import { BlogsService } from '../src/blogs/blogs.service';
import { createBlog } from './helpers/blogs-tests-helpers';



describe ('tests for blogs', () => {
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
    

    describe('create blog tests', () => {
        
        it('should return 401 status code', async () => {
            const model: blogInput = {
                name: 'name',
                description: 'description',
                websiteUrl: 'websiteUrl',
            }
            const firstRes = await createBlog('', '', model, httpServer)
            expect(firstRes.status).toBe(401)

            const secondRes = await createBlog('any', 'any', model, httpServer)
            expect(secondRes.status).toBe(401)

            const thirdRes = await createBlog('admin', 'qwerty', model, httpServer)
            expect(thirdRes.status).not.toBe(401)
        })

        it('should return 400 status code with errors', async () => {
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
            const firstRes = await createBlog('admin', 'qwerty', {} as blogInput, httpServer)
            expect(firstRes.status).toBe(400)
            expect(firstRes.body).toEqual(errors)

            const modelOne: blogInput = {
                name: '',
                description: '',
                websiteUrl: '',
            }

            const secondRes = await createBlog('admin', 'qwerty', modelOne, httpServer)
            expect(secondRes.status).toBe(400)
            expect(secondRes.body).toEqual(errors)

            // const modelThree: blogInput = {
            //     name: 'name3',
            //     description: 'description',
            //     websiteUrl: 'https://samurai.it-incubator.com',
            // }
            // const fourthRes = await createBlog('admin', 'qwerty', modelThree)
            // expect(fourthRes.status).not.toBe(400)

            
        })

        it('should return 201 status code and created blog', async () => {
            const model: blogInput = {
                name: 'name',
                description: 'description',
                websiteUrl: 'https://samurai.it-incubator.com',
            }
            const res = await createBlog('admin', 'qwerty', model, httpServer)

            expect(res.status).toBe(201)
            expect(res.body ).toEqual({
                id: expect.any(String),
                name: model.name,
                description: model.description,
                websiteUrl: model.websiteUrl,
                createdAt: expect.any(String),
                isMembership: false
            })

            expect.setState({blog: res.body})
        })

        it('should return 200 status code and created blog', async () => {
            const {blog} = expect.getState()
            const res = await request(httpServer).get(`/blogs/${blog.id}`)
            expect(res.status).toBe(200)
            expect(res.body).toEqual(blog)
        })

        
        it('обновление блога',async () => {
            const {blog} = expect.getState()
            const data: blogInput = {
                name: "UpdateBlog",
                description: "string",
                websiteUrl: 'https://samurai.it-incubator.com',
            }
            const res = await request(httpServer).put(`/blogs/${blog.id}`)
                                          .set({Authorization: 'Basic YWRtaW46cXdlcnR5'})
                                          .send(data)
                                          .expect(204)
            const result = await request(httpServer).get(`/blogs/${blog.id}`)
            expect(result.body).toEqual({
                id: blog.id,
                name: data.name,
                description: data.description,
                websiteUrl: data.websiteUrl,
                createdAt: expect.any(String),
                isMembership: false})
            })

            it('удаление блога',async () => {
                const {blog} = expect.getState()
                const res = await request(httpServer).delete(`/blogs/${blog.id}`)
                                              .set({Authorization: 'Basic YWRtaW46cXdlcnR5'})
                                              .expect(204)
                const result = await request(httpServer).get(`/blogs`)

                expect(result.status).toBe(200)
                expect(result.body).toEqual(({pagesCount: 0,
                    page: 1,
                    pageSize: 10,
                    totalCount: 0,
                    items: []
                   }))
            })

    })

})