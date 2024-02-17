import { queryPaginationType } from './../../../helpers/query-filter';
import { BlogsQueryRepoPSQL } from './../../../blogs/db-psql/blogs.query.repo.PSQL';
import { commentViewModel, paginationGetCommentsByBlog } from '../../model/comments-model';
import { CommentsQueryRepoPSQL } from '../../db-psql/comments.query.repo.PSQL';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"

export class GetCommentsByBlogCommand {
    constructor(public userId: string, public  pagination: queryPaginationType) {

    }
}

@CommandHandler(GetCommentsByBlogCommand)
export class GetCommentsByBlogUseCase implements ICommandHandler<GetCommentsByBlogCommand>{
    constructor(private commentsQueryRepository: CommentsQueryRepoPSQL,
        private blogsQueryRepository: BlogsQueryRepoPSQL) {

    }
    async execute(command: GetCommentsByBlogCommand): Promise<paginationGetCommentsByBlog | null> {
        const blog = await this.blogsQueryRepository.getBlogsByBlogger(command.userId)
        if (!blog) {
            return null
        }
        const comments = await this.commentsQueryRepository.findCommentsByBlog(blog._id, command.userId, command.pagination)
        if (!comments) {
            return {
                pagesCount: 0,
                page: 0,
                pageSize: 0,
                totalCount: 0,
                items: []
              }
        }
        return comments
    }
}
