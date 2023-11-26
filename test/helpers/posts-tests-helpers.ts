// import  request  from "supertest";
// import { app } from "../../src/app";
// import { postInputModel, postInputModelSpecific } from "../../src/types/types-posts";



// export const createPost = async ( saLogin: string, saPwd: string, model: postInputModel,) => {
//     const result = await request(app).post('/posts').auth(saLogin, saPwd).send(model)
//     return result
// }
// export const createPostSpecific = async ( saLogin: string, saPwd: string, blogId: string, model: postInputModelSpecific,) => {
//     const result = await request(app).post(`/blogs/${blogId}/posts`).auth(saLogin, saPwd).send(model)
//     return result
// }
