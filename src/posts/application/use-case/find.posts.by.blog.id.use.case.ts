import { paginatorPost } from './../../model/post-model';
import { PostQueryRepoPSQL } from './../../db-psql/post.query.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { queryPaginationType } from './../../../helpers/query-filter';
export class FindPostsByBlogIdCommand {
  constructor(
    public paginationQuery: queryPaginationType,
    public blogId: string,
    public userId: string | null,
  ) {}
}

@CommandHandler(FindPostsByBlogIdCommand)
export class FindPostsByBlogIdUseCase
  implements ICommandHandler<FindPostsByBlogIdCommand>
{
  constructor(private postQueryRepo: PostQueryRepoPSQL) {}
  async execute(
    command: FindPostsByBlogIdCommand,
  ): Promise<paginatorPost | null> {
    const paginationQuery: queryPaginationType = command.paginationQuery;
    const blogId: string = command.blogId;
    const userId: string | null = command.userId;
    return this.postQueryRepo.findPostsBlogId(paginationQuery, blogId, userId);
  }
}
