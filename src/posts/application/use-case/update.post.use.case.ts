import { PostRepoPSQL } from './../../db-psql/post.repo';
import { PostQueryRepoPSQL } from './../../db-psql/post.query.repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public title: string,
    public shortDescription: string,
    public content: string,
  ) {}
}
@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postQueryRepo: PostQueryRepoPSQL,
    private postRepository: PostRepoPSQL,
  ) {}
  async execute(command: UpdatePostCommand): Promise<boolean | null> {
    const postId: string = command.postId;
    const title: string = command.title;
    const shortDescription: string = command.shortDescription;
    const content: string = command.content;

    const post = await this.postQueryRepo.getPostId(postId, null);
    if (!post) {
      return null;
    }
    const result = await this.postRepository.updatePostId(
      postId,
      title,
      shortDescription,
      content,
    );
    if (result) {
      return true;
    } else {
      return null;
    }
  }
}
