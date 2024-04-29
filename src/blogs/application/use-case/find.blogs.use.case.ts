import { paginatorBlog } from './../../models/blogs-model';
import { BlogsQueryRepoPSQL } from './../../db-psql/blogs.query.repo.PSQL';
import { queryPaginationType } from './../../../helpers/query-filter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class FindBlogsCommand {
  constructor(
    public paginationQuery: queryPaginationType,
    public userId: string | null,
  ) {}
}

@CommandHandler(FindBlogsCommand)
export class FindBlogsUseCase implements ICommandHandler<FindBlogsCommand> {
  constructor(private blogsQueryRepository: BlogsQueryRepoPSQL) {}
  async execute(command: FindBlogsCommand): Promise<paginatorBlog> {
    return await this.blogsQueryRepository.findBlogs(
      command.paginationQuery,
      command.userId,
    );
  }
}
