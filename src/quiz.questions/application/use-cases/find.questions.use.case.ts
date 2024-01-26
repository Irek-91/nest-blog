import { queryPaginationQuestionsType } from './../../../helpers/query-filter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsQueryRepository } from '../../db-psql/questions.query.repo';
import { Injectable } from "@nestjs/common";

export class FindQuestionsComand {
    constructor (public paginationQuery: queryPaginationQuestionsType) {

    }
}

@CommandHandler(FindQuestionsComand)
export class FindQuestionsUseCase implements ICommandHandler<FindQuestionsComand> {
  constructor(protected questionsQueryRepository: QuestionsQueryRepository) { }


  async execute (comand: FindQuestionsComand)  {
    return await this.questionsQueryRepository.findQuestions(comand.paginationQuery)
  }

}