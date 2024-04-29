import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../db-psql/questions.repo';

export class DeleteQuestionIdCommand {
  constructor(public questionId: string) {}
}

@CommandHandler(DeleteQuestionIdCommand)
export class DeleteQuestionIdUseCase
  implements ICommandHandler<DeleteQuestionIdCommand>
{
  constructor(protected questionsRepository: QuestionsRepository) {}

  async execute(command: DeleteQuestionIdCommand): Promise<boolean> {
    return await this.questionsRepository.deleteQuestionId(command.questionId);
  }
}
