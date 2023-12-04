// import { ObjectId } from 'mongodb';
// import request from 'supertest'
// import { app } from "../src/app"
// import { connectDisconnectDb, runDbMongoose } from "../src/db/db-mongoos"
// import { userInputModel } from '../src/types/user'
// import { createUser } from './helpers/users-tests-helpers'
// import { blogInput } from '../src/types/types-blogs'
// import { createBlog } from './helpers/blogs-tests-helpers'
// import { postInput } from '../src/types/types-posts'
// import { createPost } from './helpers/posts-tests-helpers'
// import { createComment } from './helpers/comment_created'
// import { jwtService } from '../src/application/jwt-service'
// import { log } from 'console'

// describe ('tests for comments', () => {

//     beforeAll(async () => {
//         await runDbMongoose()
//         await request(app).delete('/testing/all-data')

//     })
//     afterAll (async () => {
//         await connectDisconnectDb()
//     })
//     describe('действия с коментариями', () => {
//         it ('обновление коментария ', async () => {
//             const userModel: userInputModel = {
//                 login: 'panda',
//                 password: 'panda2023',
//                 email: 'panda@mail.com',
//             }
//             const user = await createUser('admin', 'qwerty', userModel)
//             const userOne = user.user
//             expect.setState({userOne: userOne})

//             const model: blogInput = {
//                 name: 'nameComment',
//                 description: 'create comment tests',
//                 websiteUrl: 'https://samurai.it-incubator.com',
//             }
//             const res = await createBlog('admin', 'qwerty', model)
//             expect.setState({blog: res.body})
//             const {blog} = expect.getState()

//             const data: postInput = {
//                 title: "string",
//                 shortDescription: "string",
//                 content: "string",
//                 blogId: blog.id,
//                 blogName: blog.name,
//                 createdAt: new Date().toISOString()
//             }
//             const creatResponse = await createPost('admin', 'qwerty', data)
//             const getPosts = creatResponse.body
//             expect.setState({post: getPosts})
//             const {post} = expect.getState()

//             const newCommentData = {
//                 content: "coments of post!!!!!!!!!!!!!!!"    
//             }
    
//             const createCommment = await createComment(post.id, newCommentData, 201, new ObjectId(userOne.id))
//             const comment = createCommment.createdComment
//             expect.setState({comment: comment})      

//             const AccessToken = await jwtService.createdJWTAccessToken(new ObjectId(userOne.id))
//             const headersJWT = {Authorization: `Bearer ${AccessToken}`}
            
//             const updateCommentData = {
//                 content: "update coments of post!!!!!!!!!!!!!!!"    
//             }
//             const commentId = createCommment.createdComment!.id
//             const result = await request(app).put(`/comments/${commentId}`)
//                                       .set(headersJWT)
//                                       .send(updateCommentData)
//                                       .expect(204)
//             expect(result.status).toBe(204)

//             const resultUpdate = await request(app).get(`/comments/${commentId}`)
//             expect(resultUpdate.status).toBe(200)
//             expect(resultUpdate.body).toEqual({
//                 id: expect.any(String),
//                 content: updateCommentData.content,
//                 commentatorInfo: {
//                   userId: userOne.id,
//                   userLogin: userOne.login
//                 },
//                 createdAt: expect.any(String),
//                 likesInfo: {
//                   likesCount: 0,
//                   dislikesCount: 0,
//                   myStatus: "None"
//                 }
//               })
//         })

//         it ('обновление коментария не тем пользователем ', async () => {
//             const {blog} = expect.getState()
//             const {post} = expect.getState()
//             const {comment} = expect.getState()
//             const {userOne} = expect.getState()
//             const userModelTwo: userInputModel = {
//                 login: 'medved',
//                 password: 'panda2023',
//                 email: 'panda@mail.com',
//             }
//             const user = await createUser('admin', 'qwerty', userModelTwo)
//             const userTwo = user.user
//             expect.setState({userTwo: userTwo})

//             expect.setState({userTwo: userTwo})
//             const AccessTokenTwo = await jwtService.createdJWTAccessToken(new ObjectId(userTwo.id))
//             const headersJWTTwo = {Authorization: `Bearer ${AccessTokenTwo}`}
//             const updateCommentData = {
//                 content: "coments of post!!!!!!!!!!!!!!!"    
//             }
//             const result = await request(app).put(`/comments/${comment.id}`)
//                                       .set(headersJWTTwo)
//                                       .send(updateCommentData)
//                                       .expect(403)
//             expect(result.status).toBe(403)


//         })
//         it ('лайк коментария', async () => {
//             const {blog} = expect.getState()
//             const {post} = expect.getState()
//             const {comment} = expect.getState()
//             const {userOne} = expect.getState()
//             const {userTwo} = expect.getState()
//             const AccessTokenOne = await jwtService.createdJWTAccessToken(userOne.id)
//             const headersJWTOne = {Authorization: `Bearer ${AccessTokenOne}`}
//             const AccessTokeTwo = await jwtService.createdJWTAccessToken(userTwo.id)
//             const headersJWTTwo = {Authorization: `Bearer ${AccessTokeTwo}`}

//             const likeStatusDataOne = {
//                 likeStatus: "Like"
//               }
//             const resultOne = await request(app).put(`/comments/${comment.id}/like-status`)
//                     .set(headersJWTOne)
//                     .send(likeStatusDataOne)
//                     .expect(204)
          
//             const likeStatusDataTwo = {
//                 likeStatus: "Dislike"
//               }
//             const resultTwo = await request(app).put(`/comments/${comment.id}/like-status`)
//                     .set(headersJWTTwo)
//                     .send(likeStatusDataTwo)
//                     .expect(204)
                    
//             const resultUpdateLikeForUserOne = await request(app).get(`/comments/${comment.id}`)
//             .set(headersJWTOne)

//             expect(resultUpdateLikeForUserOne.body).toEqual({
//                 id: expect.any(String),
//                 content: expect.any(String),
//                 commentatorInfo: {
//                   userId: userOne.id,
//                   userLogin: userOne.login
//                 },
//                 createdAt: expect.any(String),
//                 likesInfo: {
//                   likesCount: 1,
//                   dislikesCount: 1,
//                   myStatus: "Like"
//                 }
//             })

//             const resultUpdateLikeForUserTwo = await request(app).get(`/comments/${comment.id}`)
//             .set(headersJWTTwo)
            
//             expect(resultUpdateLikeForUserTwo.body).toEqual({
//                 id: expect.any(String),
//                 content: expect.any(String),
//                 commentatorInfo: {
//                   userId: userOne.id,
//                   userLogin: userOne.login
//                 },
//                 createdAt: expect.any(String),
//                 likesInfo: {
//                   likesCount: 1,
//                   dislikesCount: 1,
//                   myStatus: "Dislike"
//                 }
//             })



//         })
//     })
// })