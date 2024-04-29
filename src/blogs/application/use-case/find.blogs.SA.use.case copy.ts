import { BlogsQueryRepoPSQL } from '../../db-psql/blogs.query.repo.PSQL';
import { queryPaginationType } from '../../../helpers/query-filter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class FindBlogsSACommand {
  constructor(public paginationQuery: queryPaginationType) {}
}

@CommandHandler(FindBlogsSACommand)
export class FindBlogsSAUseCase implements ICommandHandler<FindBlogsSACommand> {
  constructor(private blogsQueryRepository: BlogsQueryRepoPSQL) {}
  async execute(command: FindBlogsSACommand) {
    return await this.blogsQueryRepository.findBlogsSA(command.paginationQuery);
  }
}
