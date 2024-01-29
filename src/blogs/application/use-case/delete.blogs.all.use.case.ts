import { BlogsRepoPSQL } from './../../db-psql/blogs.repo.PSQL';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class DeleteBlogsAllCommand {
    constructor() {
    }
}


@CommandHandler(DeleteBlogsAllCommand)
export class DeleteBlogsAllUseCase implements ICommandHandler<DeleteBlogsAllCommand> {
    constructor (private blogsRepository: BlogsRepoPSQL) {
    }
    async execute(): Promise<Number> {
        return await this.blogsRepository.deleteBlogAll()
    }
}