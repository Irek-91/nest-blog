import { QuestionInputModel } from '../../src/quizQuestions/model/questionModel';
import { userInputModel, userViewModel } from '../../src/users/models/users-model';
import { settings } from '../../src/settings';
import { ObjectId } from 'mongodb';
import  request  from "supertest";
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import jwt from 'jsonwebtoken'
import { log } from 'console';
import { questionViewModel } from 'src/quizQuestions/model/questionModel';

type headers = {
    Authorization: string
}

    


export const createQuestions = async ( saLogin: string, saPwd: string, model: QuestionInputModel, httpServer: any): Promise<{ response: request.Response;
    question: questionViewModel}> => {
    const response = await request(httpServer).post('/sa/quiz/questions').auth(saLogin, saPwd).send(model)
    const question = response.body
    return { response, question}
}
