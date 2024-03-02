import { BlogsRepoPSQL } from './../../db-psql/blogs.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { blogInput } from './../../models/blogs-model';
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
    async execute(command: SubscriptionUserToBlog): Promise<any> {
        const blogId = command.blogId
        const userId = command.userId

        const queryRunner = this.dataSource.createQueryRunner()
        const manager = queryRunner.manager
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const res = await this.blogsRepository.subscriptionUser(blogId, userId, manager)
            await queryRunner.commitTransaction()
            return true
        } catch (e) {
            await queryRunner.rollbackTransaction()
            return null
        }
    }


}