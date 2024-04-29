import { BlogsQueryRepoPSQL } from './../../../blogs/db-psql/blogs.query.repo.PSQL';
import { AuthLinkViewModel } from './../../../adapters/telegram-adapter';
import { User } from '../../db-psql/entity/user.entity';
import { UsersQueryRepoPSQL } from '../../db-psql/users.qurey.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetLinkForSuscriber {
  constructor(public userId: string) {}
}

@CommandHandler(GetLinkForSuscriber)
export class GetLinkForSuscriberUseCase implements ICommandHandler {
  constructor(private blogsQueryRepoPSQL: BlogsQueryRepoPSQL) {}
  async execute(
    command: GetLinkForSuscriber,
  ): Promise<AuthLinkViewModel | null> {
    const code = await this.blogsQueryRepoPSQL.getCodeBySubscriber(
      command.userId,
    );
    if (!code) {
      return null;
    }
    return {
      link: `https://t.me/BlogPlatform_Bot?code=${code}`,
    };
  }
}
