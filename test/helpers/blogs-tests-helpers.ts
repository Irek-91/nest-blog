import { blogInput } from "../../src/blogs/models/blogs-model";
import  request  from "supertest";

export const createBlog = async ( saLogin: string, saPwd: string, model: blogInput, httpServer: any) => {
     
    const result = await request(httpServer).post('/blogs').auth(saLogin, saPwd).send(model)
    return result
}