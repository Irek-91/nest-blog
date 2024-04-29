import { BlogsRepoPSQL } from '../../db-psql/blogs.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { blogInput } from '../../models/blogs-model';

export class UpdateBanStatusByBlogCommand {
  constructor(
    public blogId: string,
    public banStatus: boolean,
  ) {}
}

@CommandHandler(UpdateBanStatusByBlogCommand)
export class UpdateBanStatusByBlogUseCase
  implements ICommandHandler<UpdateBanStatusByBlogCommand>
{
  constructor(private blogsRepository: BlogsRepoPSQL) {}
  async execute(
    command: UpdateBanStatusByBlogCommand,
  ): Promise<boolean | null> {
    const blogId = command.blogId;
    const banStatus = command.banStatus;
    return await this.blogsRepository.updateBanStatusByBlogId(
      blogId,
      banStatus,
    );
  }
}
