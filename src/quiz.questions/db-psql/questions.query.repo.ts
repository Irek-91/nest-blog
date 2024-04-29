import { queryPaginationQuestionsType } from '../../helpers/query-filter';
import {
  questionViewModel,
  questionDBModel,
  paginatorQuestions,
} from '../model/questionModel';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Question } from './entity/question';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class QuestionsQueryRepository {
  constructor(@InjectDataSource() private questionsModel: DataSource) {}

  async findQuestions(
    pagination: queryPaginationQuestionsType,
  ): Promise<paginatorQuestions> {
    try {
      let filterPublished = {};
      if (pagination.publishedStatus === 'published') {
        filterPublished = { published: true };
      }
      if (pagination.publishedStatus === 'notPublished') {
        filterPublished = { published: false };
      }
      const totalCount = await this.questionsModel
        .getRepository(Question)
        .createQueryBuilder()
        .getCount();
      const pagesCount = Math.ceil(totalCount / pagination.pageSize);

      const questions = await this.questionsModel
        .getRepository(Question)
        .createQueryBuilder('q')
        //.leftJoinAndSelect('c.postId', 'p')
        .where(filterPublished)
        .orderBy(`q.${pagination.sortBy}`, pagination.sortDirection)
        .skip(pagination.skip)
        .take(pagination.pageSize)
        .getMany();

      const questionsComments: questionViewModel[] = await Promise.all(
        questions.map(async (c) => {
          return {
            id: c.id,
            body: c.body,
            correctAnswers: c.answers,
            published: c.published,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          };
        }),
      );

      return {
        pagesCount: pagesCount,
        page: pagination.pageNumber,
        pageSize: pagination.pageSize,
        totalCount: totalCount,
        items: questionsComments,
      };
    } catch (e) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
  }

  async getQuestiontById(id: string): Promise<questionDBModel | null> {
    const question = await this.questionsModel
      .getRepository(Question)
      .createQueryBuilder('q')
      .where({ id: id })
      .getOne();
    return question;
  }

  async getFiveRandomQuestions(): Promise<string[]> {
    const questions = await this.questionsModel
      .getRepository(Question)
      .createQueryBuilder('q')
      .select()
      .orderBy('RANDOM()')
      .take(5)
      .getMany();

    const result = questions.map((q) => {
      return q.id;
    });

    return result;
  }

  async getAnswerByQuestiontId(id: string): Promise<string[]> {
    const question = await this.questionsModel
      .getRepository(Question)
      .createQueryBuilder()
      .where({ id: id })
      .getOne();
    return question!.answers;
  }
}
