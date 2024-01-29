import { BlogsQueryRepoPSQL } from './../../db-psql/blogs.query.repo.PSQL';
import { blogOutput } from './../../models/blogs-model';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class GetBlogIdCommand {
    constructor (public id: string) {
    }
}



@CommandHandler(GetBlogIdCommand) 
export class GetBlogIdUseCase implements ICommandHandler<GetBlogIdCommand> {
constructor (private blogsQueryRepository: BlogsQueryRepoPSQL) {

}
    async execute(command: GetBlogIdCommand): Promise<blogOutput> {
        return await this.blogsQueryRepository.getBlogId(command.id)
    }
}