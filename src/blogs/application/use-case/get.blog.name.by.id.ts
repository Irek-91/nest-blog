import { BlogsQueryRepoPSQL } from './../../db-psql/blogs.query.repo.PSQL';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"

export class GetBlogNameByIdCommand {
    constructor(public id: string) {

    }
}


@CommandHandler(GetBlogNameByIdCommand)
export class GetBlogNameByIdUseCase implements ICommandHandler<GetBlogNameByIdCommand> {
    constructor(private blogsQueryRepository: BlogsQueryRepoPSQL) {
    }
    async execute(command: GetBlogNameByIdCommand): Promise<string | null> {
        return await this.blogsQueryRepository.getBlogNameById(command.id)
    }

}