import { BlogsQueryRepoPSQL } from './../../db-psql/blogs.query.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionStatus } from './../../models/blogs-model';
export class CheckStatusSubscriptionUserCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public status: SubscriptionStatus,
  ) {}
}

@CommandHandler(CheckStatusSubscriptionUserCommand)
export class CheckStatusSubscriptionUserUseCase
  implements ICommandHandler<CheckStatusSubscriptionUserCommand>
{
  constructor(private blogsQueryRepoPSQL: BlogsQueryRepoPSQL) {}
  async execute(
    command: CheckStatusSubscriptionUserCommand,
  ): Promise<true | null> {
    const blogId = command.blogId;
    const userId = command.userId;
    const status = command.status;
    const result = await this.blogsQueryRepoPSQL.checkStatusSubscriptionUser(
      blogId,
      userId,
      status,
    );
    if (result !== null) {
      return true;
    }
    return null;
  }
}
