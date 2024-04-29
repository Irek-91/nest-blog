import { queryPaginationQuestionsType } from './../../../helpers/query-filter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsQueryRepository } from '../../db-psql/questions.query.repo';

export class FindQuestionsCommand {
  constructor(public paginationQuery: queryPaginationQuestionsType) {}
}

@CommandHandler(FindQuestionsCommand)
export class FindQuestionsUseCase
  implements ICommandHandler<FindQuestionsCommand>
{
  constructor(protected questionsQueryRepository: QuestionsQueryRepository) {}

  async execute(comand: FindQuestionsCommand) {
    return await this.questionsQueryRepository.findQuestions(
      comand.paginationQuery,
    );
  }
}
