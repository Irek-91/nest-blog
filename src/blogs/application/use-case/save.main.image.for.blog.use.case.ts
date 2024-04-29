import { blogsImageWiewModel } from './../../models/blogs-model';
import { S3StorageAdapter } from '../../../adapters/s3-storage-adapter';
import { BlogsRepoPSQL } from '../../db-psql/blogs.repo.PSQL';
import { BlogsQueryRepoPSQL } from '../../db-psql/blogs.query.repo.PSQL';
import { CommandHandler } from '@nestjs/cqrs';

export class SaveMainImageForBlogCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public file: Express.Multer.File,
  ) {}
}

@CommandHandler(SaveMainImageForBlogCommand)
export class SaveMainImageForBlogUseCase {
  constructor(
    private blogsQueryRepository: BlogsQueryRepoPSQL,
    private blogsRepository: BlogsRepoPSQL,
    private s3StorageAdapter: S3StorageAdapter,
  ) {}

  async execute(
    command: SaveMainImageForBlogCommand,
  ): Promise<blogsImageWiewModel | null> {
    const userId = command.userId;
    const file = command.file;
    const blogId = command.blogId;
    const result = await this.s3StorageAdapter.saveMainImageForBlog(
      userId,
      file,
    );
    if (!result) {
      return null;
    }
    const saveInfoInDB = await this.blogsRepository.saveInfoByMainImageInDB(
      blogId,
      result.url,
      result.fileId,
      file.size,
    );
    if (!saveInfoInDB) {
      return null;
    }
    const res = await this.blogsQueryRepository.getImagesByBlog(blogId);
    return res;
  }
}
