import { BlogsRepoPSQL } from './../../db-psql/blogs.repo.PSQL';
import { blogInput, blogMongoDB, blogOutput } from './../../models/blogs-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';


export class CreateBlogCommand {
    constructor(public blogInputData: blogInput) {
    }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
    constructor (private blogsRepository: BlogsRepoPSQL) {

    }
    
    async execute( command: CreateBlogCommand): Promise<blogOutput> {
        const blogInputData = command.blogInputData
        const createdAt = new Date().toISOString()
        const newBlog: blogMongoDB= {
            _id: uuidv4(),
            name: blogInputData.name,
            description: blogInputData.description,
            websiteUrl: blogInputData.websiteUrl,
            createdAt,
            isMembership: false
        }

        //const newBlogInstance = new Blog(newBlog)


        await this.blogsRepository.createBlog(newBlog)
        return {
            id: newBlog._id.toString(),
            name: newBlog.name,
            description: newBlog.description,
            websiteUrl: newBlog.websiteUrl,
            createdAt: newBlog.createdAt,
            isMembership: newBlog.isMembership
        }
    }


}