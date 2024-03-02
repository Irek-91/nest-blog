import { UsersQueryRepoPSQL } from './../../../users/db-psql/users.qurey.repo.PSQL';
import { BlogsRepoPSQL } from './../../db-psql/blogs.repo.PSQL';
import { SubscriptionStatus, blogInput, blogMongoDB, blogOutput, blogPSQLDB } from './../../models/blogs-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';


export class CreateBlogCommand {
    constructor(public blogInputData: blogInput,
        public userId: string | null) {
    }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
    constructor (private blogsRepository: BlogsRepoPSQL,
        private usersRepo: UsersQueryRepoPSQL) {

    }
    
    async execute( command: CreateBlogCommand): Promise<blogOutput> {
        let userLogin : string | null = null
        let userId: string | null = null 
        let isMembership: boolean = false
        if (command.userId) {
            const user = await this.usersRepo.getUserById(command.userId)
            userLogin = user!.login, 
            userId = user!._id
            isMembership = false
        }

        const blogInputData = command.blogInputData
        const createdAt = new Date().toISOString()
        const newBlog: blogPSQLDB = {
            _id: uuidv4(),
            name: blogInputData.name,
            description: blogInputData.description,
            websiteUrl: blogInputData.websiteUrl,
            createdAt,
            postId: null,
            isMembership: isMembership,
            userId: userId,
            userLogin: userLogin
        }

        //const newBlogInstance = new Blog(newBlog)
        const res = await this.blogsRepository.createBlog(newBlog)
        
        return {
            id: newBlog._id.toString(),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: newBlog.createdAt,
            isMembership: newBlog.isMembership,
            images: {
                wallpaper: null,
                main: []
              },
            subscribersCount: 0,
            currentUserSubscriptionStatus: SubscriptionStatus.None
        }
    }

}