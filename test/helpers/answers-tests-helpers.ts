import { answerViewModel, AnswerInputModel } from './../../src/quiz.pair/model/games.model';
import { settings } from './../../src/settings';
import  jwt  from 'jsonwebtoken';

import request from "supertest";
import { QuestionInputModel, questionViewModel } from '../../src/quiz.questions/model/questionModel';

type headers = {
    Authorization: string
}




export const sendAnswerOneByUser = async (user: any,  model: AnswerInputModel, httpServer: any): Promise<{
    result: request.Response;
    answer: answerViewModel
}> => {
    const AccessTokenOne = jwt.sign({ userId: user.id }, settings.JWT_SECRET, { expiresIn: 100 })
    const headersJWTOne = { Authorization: `Bearer ${AccessTokenOne}` }

    const result = await request(httpServer)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set(headersJWTOne)
        .send(model)
        .expect(200)

    expect(result.body).toEqual(
        {
            questionId: expect.any(String),
            answerStatus: "Correct",
            addedAt: expect.any(String)
        }
    )
    const answer = result.body
    return { result, answer }
}
