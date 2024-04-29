import { BlogsQueryRepoPSQL } from './../../db-psql/blogs.query.repo.PSQL';
import { Blog } from './../../db-psql/entity/blog.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetBlogsByBloggerCommand {
  constructor(public bloggerId: string) {}
}

@CommandHandler(GetBlogsByBloggerCommand)
export class GetBlogsByBloggerUseCase
  implements ICommandHandler<GetBlogsByBloggerCommand>
{
  constructor(private blogsQueryRepository: BlogsQueryRepoPSQL) {}
  async execute(command: GetBlogsByBloggerCommand): Promise<Blog | null> {
    const blogs = await this.blogsQueryRepository.getBlogsByBlogger(
      command.bloggerId,
    );
    return blogs;
  }
}
