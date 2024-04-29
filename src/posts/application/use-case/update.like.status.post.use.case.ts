import { PostRepoPSQL } from './../../db-psql/post.repo';
import { PostQueryRepoPSQL } from './../../db-psql/post.query.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateLikeStatusPostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: string,
  ) {}
}

@CommandHandler(UpdateLikeStatusPostCommand)
export class updateLikeStatusPostUseCase
  implements ICommandHandler<UpdateLikeStatusPostCommand>
{
  constructor(
    private postQueryRepo: PostQueryRepoPSQL,
    private postRepository: PostRepoPSQL,
  ) {}
  async execute(command: UpdateLikeStatusPostCommand): Promise<true | null> {
    const result = await this.postQueryRepo.getPostId(command.postId, null);

    if (!result) {
      return null;
    }
    const resultUpdate = await this.postRepository.updateLikeStatusPostId(
      command.postId,
      command.userId,
      command.likeStatus,
    );
    if (!resultUpdate) {
      return null;
    } else {
      return true;
    }
  }
}
