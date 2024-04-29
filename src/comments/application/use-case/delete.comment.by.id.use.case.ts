import { CommentsRepoPSQL } from './../../db-psql/comments.repo.PSQL';
import { CommentsQueryRepoPSQL } from './../../db-psql/comments.query.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteCommentByIdCommand {
  constructor(
    public commentsId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentByIdCommand)
export class DeleteCommentByIdUseCase
  implements ICommandHandler<DeleteCommentByIdCommand>
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepoPSQL,
    private commentsRepository: CommentsRepoPSQL,
  ) {}
  async execute(command: DeleteCommentByIdCommand): Promise<boolean | null> {
    try {
      const commentById = await this.commentsQueryRepository.findCommentById(
        command.commentsId,
        command.userId,
      );
      if (!commentById) {
        return null;
      }
      if (commentById.commentatorInfo.userId === command.userId) {
        const result = await this.commentsRepository.deletCommentById(
          command.commentsId,
        );
        if (result === true) {
          return true;
        } else {
          return null;
        }
      } else {
        return false;
      }
    } catch (e) {
      return null;
    }
  }
}
