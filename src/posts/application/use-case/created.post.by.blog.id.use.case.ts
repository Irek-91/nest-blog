import { TelegramAdapter } from '../../../infrastructure/adapters/telegram-adapter';
import { PostRepoPSQL } from './../../db-psql/post.repo';
import { BlogsQueryRepoPSQL } from './../../../blogs/db-psql/blogs.query.repo.PSQL';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  postInputModel,
  postOutput,
  postMongoDb,
} from './../../model/post-model';
import { v4 as uuidv4 } from 'uuid';

export class CreatedPostByBlogIdCommand {
  constructor(public postData: postInputModel) {}
}

@CommandHandler(CreatedPostByBlogIdCommand)
export class CreatedPostByBlogIdUseCase
  implements ICommandHandler<CreatedPostByBlogIdCommand>
{
  constructor(
    private blogQueryRepository: BlogsQueryRepoPSQL,
    private postRepository: PostRepoPSQL,
    private telegramAdapter: TelegramAdapter,
  ) {}

  async execute(
    command: CreatedPostByBlogIdCommand,
  ): Promise<postOutput | null> {
    const postData = command.postData;
    const newPostId = uuidv4();
    const createdAt = new Date().toISOString();
    const blogName = await this.blogQueryRepository.getBlogNameById(
      postData.blogId,
    );
    if (!blogName) {
      return null;
    }
    const newPost: postMongoDb = {
      _id: newPostId,
      title: postData.title,
      shortDescription: postData.shortDescription,
      content: postData.content,
      blogId: postData.blogId,
      blogName: blogName.toString(),
      createdAt: createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
    const result = await this.postRepository.createdPost(newPost);

    if (!result) {
      return null;
    }
    const subscribers = await this.blogQueryRepository.findSubscribersThisBlog(
      postData.blogId,
    );
    if (subscribers !== null) {
      const text = `New post published for blog ${blogName.toString()} `;
      const send = subscribers.forEach((subscribers) =>
        this.telegramAdapter.sendMessage(text, subscribers.telegramId),
      );
    }

    return {
      id: newPost._id.toString(),
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: newPost.blogId,
      blogName: newPost.blogName,
      createdAt: newPost.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
      images: {
        main: [],
      },
    };
  }
}
