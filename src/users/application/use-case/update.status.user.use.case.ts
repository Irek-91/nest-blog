import { User } from './../../db-psql/entity/user.entity';
import { SecurityDeviceRepoPSQL } from './../../../securityDevices/db-psql/securityDevice.repo.PSQL';
import { UsersRepositoryPSQL } from './../../db-psql/users.repo.PSQL';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class UpdateStatusUserCommand {
    constructor(public userId: string,
        public isBanned: boolean,
        public banReason: string) {}
}

@CommandHandler(UpdateStatusUserCommand)
export class UpdateStatusUserUseCase implements ICommandHandler<UpdateStatusUserCommand> {
    constructor (private usersRepo: UsersRepositoryPSQL,
        private securityDeviceRepoP: SecurityDeviceRepoPSQL
        ) {

    }
    async execute(command: UpdateStatusUserCommand): Promise<User| null> {
        let banDate: string | null = new Date().toISOString()
        let banReason: string | null = command.banReason
        if (command.isBanned === false) {
            banDate = null
            banReason = null
        }
        const resultUser = await this.usersRepo.updateStatusUser(command.userId, command.isBanned, banReason, banDate)
        if (command.isBanned === true) {
            const result = await this.securityDeviceRepoP.deleteAllDevicesByUserId(command.userId)
        }
        if (!resultUser) {
            return null
        }
        return resultUser
    }

}