import { CommentsRepoPSQL } from './../../db-psql/comments.repo.PSQL';
import { CommentsQueryRepoPSQL } from './../../db-psql/comments.query.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateLikeStatusCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: string,
  ) {}
}

@CommandHandler(UpdateLikeStatusCommentCommand)
export class UpdateLikeStatusCommentUseCase
  implements ICommandHandler<UpdateLikeStatusCommentCommand>
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepoPSQL,
    private commentsRepository: CommentsRepoPSQL,
  ) {}

  async execute(command: UpdateLikeStatusCommentCommand): Promise<true | null> {
    const result = await this.commentsQueryRepository.findCommentById(
      command.commentId,
      command.userId,
    );
    if (!result) {
      return null;
    }
    return this.commentsRepository.updateLikeStatus(
      command.commentId,
      command.userId,
      command.likeStatus,
    );
  }
}
