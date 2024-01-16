import { queryPaginationQuestionsType } from './../helpers/query-filter';
import { QuestionsRepository } from './db-psql/questions.repo.PSQL';
import { QuestionInputModel, questionViewModel, questionDBModel, PublishInputModel } from './model/questionModel';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class QusetionsService {
  constructor(protected questionsRepository: QuestionsRepository) { }


  async findQuestions(paginationQuery: queryPaginationQuestionsType) {
    return await this.questionsRepository.findQuestions(paginationQuery)
  }


  async createQuestion(inputModel: QuestionInputModel): Promise<questionViewModel> {

    const newQuestion: questionDBModel = {
      id: uuidv4(),
      body: inputModel.body,
      answers: inputModel.correctAnswers,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: null
    }

    return await this.questionsRepository.createQuestion(newQuestion)
  }


  async updateQuestionId(inputModel: QuestionInputModel, questionId: string): Promise<boolean> {

    const question = await this.questionsRepository.getQuestiontById(questionId)
    if (!question) {
      return false
    }
    const updateResult = await this.questionsRepository.updateQuestionById(inputModel, questionId)
    return updateResult
  }

  async updateQuestionInPublish(inputModel: PublishInputModel, questionId: string): Promise<boolean> {

    const question = await this.questionsRepository.getQuestiontById(questionId)
    if (!question) {
      return false
    }
    const updateResult = await this.questionsRepository.updateQuestionInPublish(inputModel, questionId)
    return updateResult
  }

  async checkingCorrectAnswer(questionsId : string, answer: string): Promise<boolean> {
    const result = await this.questionsRepository.checkingCorrectAnswer(questionsId,answer)
    if (!result) {
      return false
    } else {
      return true
    }

  }

  async deleteQuestionId(questionId: string): Promise<boolean> {
    return await this.questionsRepository.deleteQuestionId(questionId)
  }

}