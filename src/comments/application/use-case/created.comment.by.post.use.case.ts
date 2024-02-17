import { CommentsRepoPSQL } from './../../db-psql/comments.repo.PSQL';
import { UsersQueryRepoPSQL } from './../../../users/db-psql/users.qurey.repo.PSQL';
import { commentViewModel } from './../../model/comments-model';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs"

export class CreatedCommentPostCommand {
    constructor(public blogId: string, public postId: string, public userId: string, public content: string) {
    }
}

@CommandHandler(CreatedCommentPostCommand)
export class CreatedCommentPostUseCase implements ICommandHandler<CreatedCommentPostCommand> {
    constructor(private usersQueryRepository: UsersQueryRepoPSQL,
        private commentsRepository: CommentsRepoPSQL) {
    }
    async execute(command: CreatedCommentPostCommand): Promise<commentViewModel | false> {
        const userId = command.userId
        const blogId = command.blogId
        const postId = command.postId
        const content = command.content

        const createdAt = new Date().toISOString();
        const user = await this.usersQueryRepository.findUserById(userId)
        const userLogin = user!.login
        const bannedBlog = await this.usersQueryRepository.getUserBannedByBlogger(userId)
        if (!bannedBlog || bannedBlog.blogId._id !== blogId) {
            const creatComment = await this.commentsRepository.createdCommentPostId(postId, content, userId, userLogin, createdAt)
            return creatComment
        } else {
            return false
        }
    }
}

