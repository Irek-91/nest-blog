import { paginatorPost } from './../../model/post-model';
import { PostQueryRepoPSQL } from './../../db-psql/post.query.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { queryPaginationType } from './../../../helpers/query-filter';
export class FindPostsCommand {
    constructor(public paginationQuery: queryPaginationType,
        public userId: string | null) {
    }
}

@CommandHandler(FindPostsCommand)
export class FindPostsUseCase implements ICommandHandler<FindPostsCommand> {
    constructor ( private postQueryRepo: PostQueryRepoPSQL) {
        
    }
    
async execute(command: FindPostsCommand): Promise < paginatorPost | null > {
    const paginationQuery: queryPaginationType = command.paginationQuery
    const userId: string | null = command.userId
    return this.postQueryRepo.findPost(paginationQuery, userId)
}
}
