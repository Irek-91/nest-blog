import { BlogsRepoPSQL } from '../../db-psql/blogs.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { blogInput } from '../../models/blogs-model';
import { DataSource } from 'typeorm';


export class UnsubscribeUserToBlog {
    constructor(public blogId: string,
        public userId: string) {
    }
}


@CommandHandler(UnsubscribeUserToBlog)
export class UnsubscribeUserToBlogUseCase implements ICommandHandler<UnsubscribeUserToBlog> {
    constructor(private blogsRepository: BlogsRepoPSQL,
        private dataSource: DataSource) {

    }
    async execute(command: UnsubscribeUserToBlog): Promise<any> {
        const blogId = command.blogId
        const userId = command.userId

        const queryRunner = this.dataSource.createQueryRunner()
        const manager = queryRunner.manager
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const res = await this.blogsRepository.unsubscribeUserToBlog(blogId, userId, manager)
            await queryRunner.commitTransaction()
            return true
        } catch (e) {
            await queryRunner.rollbackTransaction()
            return null
        }
    }


}