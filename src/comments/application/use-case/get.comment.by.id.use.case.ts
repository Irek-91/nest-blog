import { commentViewModel } from './../../model/comments-model';
import { CommentsQueryRepoPSQL } from './../../db-psql/comments.query.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetCommentByIdCommand {
  constructor(
    public commentId: string,
    public userId: string | null,
  ) {}
}

@CommandHandler(GetCommentByIdCommand)
export class GetCommentByIdUseCase
  implements ICommandHandler<GetCommentByIdCommand>
{
  constructor(private commentsQueryRepository: CommentsQueryRepoPSQL) {}
  async execute(
    command: GetCommentByIdCommand,
  ): Promise<commentViewModel | null> {
    const comment = await this.commentsQueryRepository.findCommentById(
      command.commentId,
      command.userId,
    );
    if (comment === null) {
      return null;
    } else {
      return comment;
    }
  }
}
