import { CommentsRepoPSQL } from './../../db-psql/comments.repo.PSQL';
import { CommentsQueryRepoPSQL } from './../../db-psql/comments.query.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateCommentByPostCommand {
  constructor(
    public userId: string,
    public commentsId: string,
    public content: string,
  ) {}
}

@CommandHandler(UpdateCommentByPostCommand)
export class UpdateCommentByPostUseCase
  implements ICommandHandler<UpdateCommentByPostCommand>
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepoPSQL,
    private commentsRepository: CommentsRepoPSQL,
  ) {}

  async execute(
    command: UpdateCommentByPostCommand,
  ): Promise<true | false | null> {
    const commentsId = command.commentsId;
    const userId = command.userId;
    const content = command.content;
    const comment = await this.commentsQueryRepository.findCommentById(
      commentsId,
      userId,
    );
    if (!comment) {
      return null;
    }

    if (comment!.commentatorInfo.userId === userId) {
      const result = await this.commentsRepository.updateCommentId(
        commentsId,
        content,
      );
      if (result === true) {
        return true;
      } else {
        return null;
      }
    } else {
      return false;
    }
  }
}
