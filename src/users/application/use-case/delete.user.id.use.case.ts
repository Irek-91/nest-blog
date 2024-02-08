import { UsersRepositoryPSQL } from './../../db-psql/users.repo.PSQL';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class  DeleteUserIdCommand {
    constructor(public userId :string) {

    }
}

@CommandHandler(DeleteUserIdCommand)
export class DeleteUserIdUseCase implements ICommandHandler<DeleteUserIdCommand>{
    constructor(private usersRepository: UsersRepositoryPSQL) {
    }

    async execute(command: DeleteUserIdCommand): Promise<true | null> {
    return await this.usersRepository.deleteUserId(command.userId)
  }
}