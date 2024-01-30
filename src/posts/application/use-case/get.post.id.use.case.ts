import { postOutput } from './../../model/post-model';
import { PostQueryRepoPSQL } from './../../db-psql/post.query.repo';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"

export class GetPostIdCommand {
    constructor(public id: string,
        public userId: string | null) {

    }
}

@CommandHandler(GetPostIdCommand)
export class GetPostIdUseCase implements ICommandHandler<GetPostIdCommand> {
    constructor(private postQueryRepo: PostQueryRepoPSQL) {

    }
    async execute(command: GetPostIdCommand): Promise<postOutput | null> {
        const id: string = command.id
        const userId: string | null = command.userId
        return this.postQueryRepo.getPostId(id, userId)
    }
}