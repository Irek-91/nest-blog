import { BlogsRepoPSQL } from '../../db-psql/blogs.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { blogInput } from '../../models/blogs-model';


export class BindBlogWithUserCommand {
    constructor (public blogId: string,
        public userId: string) {
    }
}


@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase implements ICommandHandler<BindBlogWithUserCommand> {
    constructor (private blogsRepository: BlogsRepoPSQL) {

    }
    async execute(command: BindBlogWithUserCommand): Promise<boolean | null> {
        const blogId = command.blogId
        const userId = command.userId
        return await this.blogsRepository.bindBlogWithUser(blogId, userId)
    }


}