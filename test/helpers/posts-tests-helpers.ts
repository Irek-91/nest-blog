import { postInputModel, postInputModelSpecific } from './../../src/posts/model/post-model';
import  request  from "supertest";



export const createPost = async ( saLogin: string, saPwd: string, model: postInputModel, httpServer: any) => {
    const result = await request(httpServer).post('/posts').auth(saLogin, saPwd).send(model)
    return result
}
export const createPostSpecific = async ( saLogin: string, saPwd: string, blogId: string, model: postInputModelSpecific, httpServer: any) => {
    const result = await request(httpServer).post(`/blogs/${blogId}/posts`).auth(saLogin, saPwd).send(model)
    return result
}
