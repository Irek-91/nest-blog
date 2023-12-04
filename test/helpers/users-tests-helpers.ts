import { ObjectId } from 'mongodb';
import  request  from "supertest";
import { JwtService } from '../../src/application/jwt-service';
import { userInputModel, userViewModel } from '../../src/users/models/users-model';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { settings } from '../../src/settings';
import jwt from 'jsonwebtoken'

type headers = {
    Authorization: string
}

    


export const createUser = async ( saLogin: string, saPwd: string, model: userInputModel, httpServer: any): Promise<{ response: request.Response;
    user: userViewModel, headers: headers}> => {
    const response = await request(httpServer).post('/users').auth(saLogin, saPwd).send(model)
    const user = response.body
    const AccessToken = jwt.sign({userId : user.id}, settings.JWT_SECRET, {expiresIn: 100})
    const headers = {Authorization: `Bearer ${AccessToken}`}
    return { response, user, headers}
}
