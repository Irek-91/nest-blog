import { UsersRepositoryPSQL } from './../../db-psql/users.repo.PSQL';
import { UsersQueryRepoPSQL } from './../../db-psql/users.qurey.repo.PSQL';
import { Blog } from './../../../blogs/db-psql/entity/blog.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanUserByBloggerInputModel } from '../../models/users-model';
export class BanUserByBloggerCommand {
    constructor (
        public banUserId: string,
        public inputModel: BanUserByBloggerInputModel) {

    }
}


@CommandHandler(BanUserByBloggerCommand)
export class BanUserByBloggerUseCase implements ICommandHandler<BanUserByBloggerCommand> {
    constructor (private usersRepo : UsersRepositoryPSQL) {

    }
    async execute(command: BanUserByBloggerCommand): Promise<null | boolean> {
        const banUserId = command.banUserId
        const blogId = command.inputModel.blogId
        const isBanned = command.inputModel.isBanned
        const banReason = command.inputModel.banReason
        const banDate = new Date().toISOString()
        
        const result = await this.usersRepo.banUserByBlog(banUserId, blogId, isBanned, banReason, banDate)
        if (!result) {
            return null
        }
        return true
    }

}