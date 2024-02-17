import { paginatorComments } from './../../model/comments-model';
import { CommentsQueryRepoPSQL } from './../../db-psql/comments.query.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { queryPaginationType } from './../../../helpers/query-filter';
export class FindCommentsByPostCommand {
    constructor(public postId: string, public userId: string | null,  public pagination: queryPaginationType) {

    }
}

@CommandHandler(FindCommentsByPostCommand) 
export class FindCommentsByPostUseCase implements ICommandHandler<FindCommentsByPostCommand> {
    constructor (private commentsQueryRepository: CommentsQueryRepoPSQL) {

    }
    async execute(command: FindCommentsByPostCommand): Promise<paginatorComments | null> {
        return this.commentsQueryRepository.findCommentsByPostId(command.postId, command.userId, command.pagination)
    }
}