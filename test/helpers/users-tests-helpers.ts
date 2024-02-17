import { userInputModel, userViewModel } from './../../src/users/models/users-model';
import { settings } from './../../src/settings';
import { ObjectId } from 'mongodb';
import  request  from "supertest";
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import jwt from 'jsonwebtoken'
import { log } from 'console';

type headers = {
    Authorization: string
}

    


export const createUser = async ( saLogin: string, saPwd: string, model: userInputModel, httpServer: any): Promise<{ response: request.Response;
    user: userViewModel, headers: headers}> => {
    const response = await request(httpServer).post('/sa/users').auth(saLogin, saPwd).send(model)
    const user = response.body
    const AccessToken = jwt.sign({userId : user.id}, settings.JWT_SECRET, {expiresIn: 200})
    const headers = {Authorization: `Bearer ${AccessToken}`}
    return { response, user, headers}
}
