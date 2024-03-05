import { BlogsRepoPSQL } from './../../db-psql/blogs.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionStatus, blogInput } from './../../models/blogs-model';
import { DataSource } from 'typeorm';


export class SubscriptionUserToBlog {
    constructor(public blogId: string,
        public userId: string) {
    }
}


@CommandHandler(SubscriptionUserToBlog)
export class SubscriptionUserToBlogUseCase implements ICommandHandler<SubscriptionUserToBlog> {
    constructor(private blogsRepository: BlogsRepoPSQL,
        private dataSource: DataSource) {

    }
    async execute(command: SubscriptionUserToBlog): Promise<true | null> {
        const blogId = command.blogId
        const userId = command.userId
        const res = await this.blogsRepository.subscriptionUser(blogId, userId)
        if (!res) {
            return null
        }
        return true
    }


}