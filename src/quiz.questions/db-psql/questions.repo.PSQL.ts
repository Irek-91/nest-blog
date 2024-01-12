import { QueryPaginationQuestionsType } from './../../helpers/query-filter';
import { questionViewModel, questionDBModel, paginatorQuestions, QuestionInputModel, PublishInputModel } from '../model/questionModel';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Question } from './entity/question';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';




@Injectable()

export class QuestionsRepository {
  constructor(@InjectDataSource() private questionsModel: DataSource) { }

  async findQuestions(pagination: QueryPaginationQuestionsType): Promise<paginatorQuestions> {
    try {
      let filterPublished = {}
      if (pagination.publishedStatus === 'published') {
        filterPublished = { published: true }
      }
      if (pagination.publishedStatus === 'notPublished') {
        filterPublished = { published: false }
      }
      const totalCount = await this.questionsModel.getRepository(Question)
        .createQueryBuilder()
        .getCount()
      const pagesCount = Math.ceil(totalCount / pagination.pageSize)

      const questions = await this.questionsModel.getRepository(Question)
        .createQueryBuilder('q')
        //.leftJoinAndSelect('c.postId', 'p')
        .where(filterPublished)
        .orderBy(`q.${pagination.sortBy}`, pagination.sortDirection)
        .skip(pagination.skip)
        .take(pagination.pageSize)
        .getMany()

      const questionsComments: questionViewModel[] = await Promise.all(questions.map(async c => {
        return {
          id: c.id,
          body: c.body,
          correctAnswers: c.answers,
          published: c.published,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        }
      }))

      return {
        pagesCount: pagesCount,
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: totalCount,
        items: questionsComments
      }

    } catch (e) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND)
    }


  }

  async getQuestiontById(id: string): Promise<questionDBModel | null> {
    const question = await this.questionsModel.getRepository(Question)
      .createQueryBuilder('q')
      .where({ id: id })
      .getOne()
    return question

  }

  async createQuestion(newQuestion: questionDBModel): Promise<questionViewModel> {

    const createUser = await this.questionsModel.createQueryBuilder()
      .insert()
      .into(Question)
      .values({
        id: newQuestion.id,
        body: newQuestion.body,
        answers: newQuestion.answers,
        published: newQuestion.published,
        createdAt: newQuestion.createdAt
      })
      .execute()


    const questionViewModel: questionViewModel = {
      id: newQuestion.id,
      body: newQuestion.body,
      correctAnswers: newQuestion.answers,
      published: newQuestion.published,
      createdAt: newQuestion.createdAt,
      updatedAt: newQuestion.updatedAt

    }
    return questionViewModel
  }

  async updateQuestionById(inputModel: QuestionInputModel, questionId: string): Promise<boolean> {
    try {

      const questionUpdate = await this.questionsModel.createQueryBuilder()
        .update(Question)
        .set({
          body: inputModel.body,
          answers: inputModel.correctAnswers,
          updatedAt: new Date().toISOString()
        })
        .where({
          id: questionId
        })
        .execute()
      if (questionUpdate.affected === 0) {
        return false
      }
      return true
    } catch (e) { return false }

  }

  
  async updateQuestionInPublish(inputModel: PublishInputModel, questionId: string): Promise<boolean> {
    try {

      const questionUpdate = await this.questionsModel.createQueryBuilder()
        .update(Question)
        .set({
          published: inputModel.published,
          updatedAt: new Date().toISOString()
        })
        .where({
          id: questionId
        })
        .execute()
      if (questionUpdate.affected === 0) {
        return false
      }
      return true
    } catch (e) { return false }

  }


  async deleteQuestionId(questionId: string): Promise<boolean> {
    try {
      //let user = await this.userModel.deleteOne({ _id: new mongoose.Types.ObjectId(userId) })
      const deleteQuestionId = await this.questionsModel.createQueryBuilder()
        .delete()
        .from(Question)
        .where({ id: questionId })
        .execute()
      if (deleteQuestionId.affected === 0) {
        return false
      }
      else {
        return true
      }
    }
    catch (e) { return false }
  }

  async deleteAllQuestions() {
    const result = await this.questionsModel.createQueryBuilder()
      .delete()
      .from(Question)
      .execute()
    return true
  }

  async getFiveRandomQuestions(): Promise<string[]> {
    const questions = await this.questionsModel.getRepository(Question)
      .createQueryBuilder('q')
      .select()
      .orderBy('RANDOM()')
      .take(5)
      .getMany()
    
    const result = questions.map(q => {
      return q.id
    })

    return result

  }

}