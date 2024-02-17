import { BlogsRepoPSQL } from './../../db-psql/blogs.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { blogInput } from './../../models/blogs-model';


export class UpdateBlogCommand {
    constructor (public blogId: string,
        public blogInputData: blogInput) {
    }
}


@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
    constructor (private blogsRepository: BlogsRepoPSQL) {

    }
    async execute(command: UpdateBlogCommand): Promise<true | null> {
        const blogId = command.blogId
        const blogInputData: blogInput = command.blogInputData
        return await this.blogsRepository.updateBlog(blogId, blogInputData)
    }


}