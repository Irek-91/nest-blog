import { QuestionInputModel, questionDBModel, questionViewModel } from '../../model/questionModel';
import { QuestionsRepository } from '../../db-psql/questions.repo';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';


export class CreateQuestionComand {
    constructor(public inputModel: QuestionInputModel) {

    }
}

@CommandHandler(CreateQuestionComand)
export class CreateQuestionUseCase implements ICommandHandler<CreateQuestionComand>{
    constructor(protected questionsRepository: QuestionsRepository
    ) { }

    async execute(comand: CreateQuestionComand): Promise<questionViewModel> {

        const newQuestion: questionDBModel = {
            id: uuidv4(),
            body: comand.inputModel.body,
            answers: comand.inputModel.correctAnswers,
            published: false,
            createdAt: new Date().toISOString(),
            updatedAt: null
        }

        return await this.questionsRepository.createQuestion(newQuestion)
    }



}
