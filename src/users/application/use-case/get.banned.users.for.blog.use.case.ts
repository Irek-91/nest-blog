import { bannedUsersViewModel } from './../../models/users-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { queryPaginationTypeUserSA } from './../../../helpers/query-filter-users-SA';
import { UsersQueryRepoPSQL } from '../../../users/db-psql/users.qurey.repo.PSQL';
export class GetBannedUsersForBlogCommand {
  constructor(
    public blogId: string,
    public paginationFilter: queryPaginationTypeUserSA,
  ) {}
}

@CommandHandler(GetBannedUsersForBlogCommand)
export class GetBannedUsersForBlogUseCase
  implements ICommandHandler<GetBannedUsersForBlogCommand>
{
  constructor(private userRepo: UsersQueryRepoPSQL) {}
  async execute(
    command: GetBannedUsersForBlogCommand,
  ): Promise<bannedUsersViewModel> {
    const blogId = command.blogId;
    const paginatorUser = command.paginationFilter;
    const bannedUsers = await this.userRepo.getUsersBannedByBlogId(
      blogId,
      paginatorUser,
    );
    return bannedUsers;
  }
}
