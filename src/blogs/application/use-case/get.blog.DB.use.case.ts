import { Blog } from './../../db-psql/entity/blog.entity';
import { BlogsQueryRepoPSQL } from '../../db-psql/blogs.query.repo.PSQL';
import { blogOutput } from '../../models/blogs-model';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class GetBlogDBCommand {
    constructor (public id: string) {
    }
}



@CommandHandler(GetBlogDBCommand) 
export class GetBlogDBUseCase implements ICommandHandler<GetBlogDBCommand> {
constructor (private blogsQueryRepository: BlogsQueryRepoPSQL) {

}
    async execute(command: GetBlogDBCommand): Promise<Blog | null> {
        return await this.blogsQueryRepository.getBlogDBById(command.id)
    }
}