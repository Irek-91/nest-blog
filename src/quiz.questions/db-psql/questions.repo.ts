import { QuestionsQueryRepository } from './questions.query.repo';
import {
  questionViewModel,
  questionDBModel,
  QuestionInputModel,
  PublishInputModel,
} from '../model/questionModel';
import { Injectable } from '@nestjs/common';
import { Question } from './entity/question';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectDataSource() private questionsModel: DataSource,
    private questionsQueryRepo: QuestionsQueryRepository,
  ) {}

  async createQuestion(
    newQuestion: questionDBModel,
  ): Promise<questionViewModel> {
    const createUser = await this.questionsModel
      .createQueryBuilder()
      .insert()
      .into(Question)
      .values({
        id: newQuestion.id,
        body: newQuestion.body,
        answers: newQuestion.answers,
        published: newQuestion.published,
        createdAt: newQuestion.createdAt,
      })
      .execute();

    const questionViewModel: questionViewModel = {
      id: newQuestion.id,
      body: newQuestion.body,
      correctAnswers: newQuestion.answers,
      published: newQuestion.published,
      createdAt: newQuestion.createdAt,
      updatedAt: newQuestion.updatedAt,
    };
    return questionViewModel;
  }

  async updateQuestionById(
    inputModel: QuestionInputModel,
    questionId: string,
  ): Promise<boolean> {
    try {
      const questionUpdate = await this.questionsModel
        .createQueryBuilder()
        .update(Question)
        .set({
          body: inputModel.body,
          answers: inputModel.correctAnswers,
          updatedAt: new Date().toISOString(),
        })
        .where({
          id: questionId,
        })
        .execute();
      if (questionUpdate.affected === 0) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async updateQuestionInPublish(
    inputModel: PublishInputModel,
    questionId: string,
  ): Promise<boolean> {
    try {
      const questionUpdate = await this.questionsModel
        .createQueryBuilder()
        .update(Question)
        .set({
          published: inputModel.published,
          updatedAt: new Date().toISOString(),
        })
        .where({
          id: questionId,
        })
        .execute();
      if (questionUpdate.affected === 0) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  async deleteQuestionId(questionId: string): Promise<boolean> {
    try {
      //let user = await this.userModel.deleteOne({ _id: new mongoose.Types.ObjectId(userId) })
      const deleteQuestionId = await this.questionsModel
        .createQueryBuilder()
        .delete()
        .from(Question)
        .where({ id: questionId })
        .execute();
      if (deleteQuestionId.affected === 0) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  async deleteAllQuestions() {
    const result = await this.questionsModel
      .createQueryBuilder()
      .delete()
      .from(Question)
      .execute();
    return true;
  }
  async checkingCorrectAnswer(
    questionsId: string,
    answer: string,
  ): Promise<boolean> {
    const result =
      await this.questionsQueryRepo.getAnswerByQuestiontId(questionsId);
    return result.includes(answer.toString());
  }
}
