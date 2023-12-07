import { LoginInputModel } from './../../src/auth/model/auth.model';
import  request  from "supertest";

export const createdAccessToken = async (model: LoginInputModel, httpServer: any) => {
    const result = await request(httpServer).post('/auth/login').send(model)
    return result
}