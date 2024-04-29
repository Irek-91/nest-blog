import { PostRepoPSQL } from './../../db-psql/post.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeletePostsByBlogIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeletePostsByBlogIdCommand)
export class DeletePostsByBlogIdUseCase
  implements ICommandHandler<DeletePostsByBlogIdCommand>
{
  constructor(private postRepository: PostRepoPSQL) {}
  async execute(command: DeletePostsByBlogIdCommand): Promise<boolean | null> {
    const result = await this.postRepository.deletePostsByBlogId(
      command.blogId,
    );
    if (!result) {
      return null;
    }
    return true;
  }
}
