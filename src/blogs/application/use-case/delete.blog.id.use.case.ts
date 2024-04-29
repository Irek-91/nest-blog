import { BlogsRepoPSQL } from './../../db-psql/blogs.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteBlogIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogIdCommand)
export class DeleteBlogIdUseCase
  implements ICommandHandler<DeleteBlogIdCommand>
{
  constructor(private blogsRepository: BlogsRepoPSQL) {}
  async execute(command: DeleteBlogIdCommand): Promise<boolean | null> {
    return await this.blogsRepository.deleteBlogId(command.id);
  }
}
