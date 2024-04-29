import { filesResizingImages } from './../../../adapters/s3-storage-adapter';
import { PostQueryRepoPSQL } from './../../db-psql/post.query.repo';
import { postImagesViewModel } from './../../model/post-model';
import { PostRepoPSQL } from './../../db-psql/post.repo';
import { S3StorageAdapter } from '../../../adapters/s3-storage-adapter';
import { CommandHandler } from '@nestjs/cqrs';
import sharp from 'sharp';

export class SaveImageForPostCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public postId: string,
    public file: Express.Multer.File,
  ) {}
}

@CommandHandler(SaveImageForPostCommand)
export class SaveImageForPostUseCase {
  constructor(
    private postsRepository: PostRepoPSQL,
    private postsQueryRepository: PostQueryRepoPSQL,
    private s3StorageAdapter: S3StorageAdapter,
  ) {}

  async execute(
    command: SaveImageForPostCommand,
  ): Promise<postImagesViewModel | null> {
    const userId = command.userId;
    const file = command.file;
    const blogId = command.blogId;
    const postId = command.postId;
    const fileMiddle = await sharp(file.buffer)
      .resize({ width: 300, height: 180 })
      .toBuffer();
    const fileSmall = await sharp(file.buffer)
      .resize({ width: 149, height: 96 })
      .toBuffer();

    const result: filesResizingImages | null =
      await this.s3StorageAdapter.saveImageForPost(
        userId,
        postId,
        file.buffer,
        fileMiddle,
        fileSmall,
      );
    if (!result) {
      return null;
    }

    const saveInfoInDB = await this.postsRepository.saveInfoByImageInDB(
      postId,
      result,
    );
    if (!saveInfoInDB) {
      return null;
    }
    const resultWiewModel =
      await this.postsQueryRepository.getImagesForPosts(postId);

    return resultWiewModel;
  }
}
