import { User } from './../../db-psql/entity/user.entity';
import { UsersQueryRepoPSQL } from './../../db-psql/users.qurey.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class GetUserByIdCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetUserByIdCommand)
export class GetUserByIdUseCase implements ICommandHandler {
  constructor(private usersQueryRepository: UsersQueryRepoPSQL) {}
  async execute(command: GetUserByIdCommand): Promise<User | null> {
    const result = await this.usersQueryRepository.getUserById(command.userId);

    return result;
  }
}
