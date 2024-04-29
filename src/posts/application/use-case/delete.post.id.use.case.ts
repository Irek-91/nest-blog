import { PostRepoPSQL } from './../../db-psql/post.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeletePostIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeletePostIdCommand)
export class DeletePostIdUseCase
  implements ICommandHandler<DeletePostIdCommand>
{
  constructor(private postRepository: PostRepoPSQL) {}
  async execute(command: DeletePostIdCommand): Promise<true | null> {
    const result = await this.postRepository.deletePostId(command.id);
    if (!result) {
      return null;
    } else {
      return true;
    }
  }
}
