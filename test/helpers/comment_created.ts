// import  request  from "supertest";
// import { app } from "../../src/app"
// import { jwtService } from "../../src/application/jwt-service";
// import { ObjectId } from "mongodb";
// import { commentViewModel } from "../../src/types/comments";

// export type comenntInput = {
//     content: string  
// }

// export const createHeadersJWT = async (userId: ObjectId) => {
//     const AccessToken = await jwtService.createdJWTAccessToken(userId)
//     const headersJWT = {Authorization: `Bearer ${AccessToken}`}
//     return headersJWT
// }

// export const createComment = async (postId: string, data: comenntInput, expectedStatusCode: number, userOneId : ObjectId): Promise<{ response: request.Response;
//     createdComment: null | commentViewModel;}> => {
//     const AccessToken = await jwtService.createdJWTAccessToken(userOneId)
//     const headersJWT = {Authorization: `Bearer ${AccessToken}`}
   

//     const response = await request(app).post(`/posts/${postId}/comments`)
//         .set(headersJWT)
//         .send(data)
//         .expect(expectedStatusCode)

//     let createdComment = null

//     if (expectedStatusCode === 201) {

//         createdComment = response.body

//         expect(createdComment).toEqual({
//             id: expect.any(String),
//             content: data.content,
//             commentatorInfo: {
//                 userId: expect.any(String),
//                 userLogin: expect.any(String)
//             },
//             createdAt: expect.any(String),
//             likesInfo: {
//                 likesCount: expect.any(Number),
//                 dislikesCount: expect.any(Number),
//                 myStatus: 'None'
//             }

//         })

//     }

//     return { response, createdComment }
// }
