import { BlogsQueryRepoPSQL } from '../../db-psql/blogs.query.repo.PSQL';
import { blogOutput } from '../../models/blogs-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetSABlogIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(GetSABlogIdCommand)
export class GetSABlogIdUseCase implements ICommandHandler<GetSABlogIdCommand> {
  constructor(private blogsQueryRepository: BlogsQueryRepoPSQL) {}
  async execute(command: GetSABlogIdCommand): Promise<blogOutput | null> {
    return await this.blogsQueryRepository.getSABlogId(command.id);
  }
}
