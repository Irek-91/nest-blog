import { ObjectId } from 'mongodb';
import  request  from "supertest";
import { JwtService } from '../../src/application/jwt-service';
import { userInputModel, userViewModel } from '../../src/users/models/users-model';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { appSettings } from 'src/app.settings';

type headers = {
    Authorization: string
}

    


export const createUser = async ( saLogin: string, saPwd: string, model: userInputModel, httpServer: any): Promise<{ response: request.Response;
    user: userViewModel, headers: headers}> => {
    const response = await request(httpServer).post('/users').auth(saLogin, saPwd).send(model)
    const user = response.body
    const AccessToken = await JwtService.prototype.createdJWTAccessToken(user.id)
    const headers = {Authorization: `Bearer ${AccessToken}`}
    return { response, user, headers}
}
