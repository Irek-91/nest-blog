import { BlogsRepoPSQL } from '../../db-psql/blogs.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { blogInput } from '../../models/blogs-model';


export class AddTelegramIdBySubscriberCommand {
    constructor (public code: string,
        public telegramId: number) {
    }
}


@CommandHandler(AddTelegramIdBySubscriberCommand)
export class AddTelegramIdBySubscriberUseCase implements ICommandHandler<AddTelegramIdBySubscriberCommand> {
    constructor (private blogsRepository: BlogsRepoPSQL) {

    }
    async execute(command: AddTelegramIdBySubscriberCommand): Promise<true | null> {
        const code = command.code
        const telegramId = command.telegramId
        return await this.blogsRepository.addTelegramIdForSuscriber(code, telegramId)
    }


}