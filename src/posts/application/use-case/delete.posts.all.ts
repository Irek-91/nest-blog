import { PostRepoPSQL } from './../../db-psql/post.repo';
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

 export class DeletePostsAllCommand {
    constructor() {

    }
 }
 
 @CommandHandler(DeletePostsAllCommand)
 export class DeletePostsAllUseCase implements ICommandHandler<DeletePostsAllCommand>{
    constructor(private postRepository: PostRepoPSQL) {
    }

 async execute(): Promise<boolean> {
        return await this.postRepository.deletePostAll()
    }
 }
 