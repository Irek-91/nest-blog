import { WallpaperImageForBlog } from './entity/wallpaper.image.blog.entity';
import { blogPSQLDB, SubscriptionStatus } from './../models/blogs-model';
import { DeletePostsByBlogIdCommand } from './../../posts/application/use-case/delete.posts.by.blog.id.use.case';
import { PostsService } from '../../posts/application/posts.service';
import { Blog } from './entity/blog.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { blogInput } from '../models/blogs-model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommandBus } from '@nestjs/cqrs';
import { MainImageForBlog } from './entity/main.image.blog.entity';
import { BlogSubscriber } from './entity/subscribers.blog.entity';

@Injectable()
export class BlogsRepoPSQL {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    //@InjectRepository(Blog) private blogRepoTypeORM: Repository<Blog>,

    protected postService: PostsService,
    private commandBus: CommandBus,
  ) {}

  async createBlog(inputData: blogPSQLDB) {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      if (inputData.userId === null) {
        const newBlog = await manager.insert(Blog, {
          _id: inputData._id.toString(),
          name: inputData.name,
          description: inputData.description,
          websiteUrl: inputData.websiteUrl,
          createdAt: inputData.createdAt,
          isMembership: inputData.isMembership,
          subscribersCount: 0,
        });
        await queryRunner.commitTransaction();
        return newBlog.generatedMaps;
      } else {
        const newBlog = await manager.insert(Blog, {
          _id: inputData._id.toString(),
          name: inputData.name,
          description: inputData.description,
          websiteUrl: inputData.websiteUrl,
          createdAt: inputData.createdAt,
          isMembership: inputData.isMembership,
          blogger: { _id: inputData.userId },
          subscribersCount: 0,
        });
        await queryRunner.commitTransaction();
        return newBlog.generatedMaps;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async updateBlog(
    blogId: string,
    bloginputData: blogInput,
  ): Promise<true | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const blog = await manager.update(
        Blog,
        { _id: blogId },
        {
          name: bloginputData.name,
          description: bloginputData.description,
          websiteUrl: bloginputData.websiteUrl,
        },
      );
      // const blog = await this.blogModel.query(`
      // UPDATE public."blogs"
      // SET name=$2, description=$3, "websiteUrl"=$4
      // WHERE "_id" = $1`, [blogId, bloginputData.name,
      //                   bloginputData.description, bloginputData.websiteUrl])
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async updateBanStatusByBlogId(
    blogId: string,
    banStatus: boolean,
  ): Promise<true | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const banDate = new Date().toISOString();
      const blog = await manager.update(
        Blog,
        { _id: blogId },
        { banStatus: banStatus, banDate: banDate },
      );

      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async bindBlogWithUser(blogId: string, userId: string): Promise<true | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const blog = await manager.update(
        Blog,
        { _id: blogId },
        { blogger: { _id: userId } },
      );

      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async saveInfoByMainImageInDB(
    blogId: string,
    url: string,
    fileId: string,
    fileSize: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const createDate = new Date().toISOString();
      const newMainImage = await manager.insert(MainImageForBlog, {
        url: url,
        fileId: fileId,
        createdAt: createDate,
        fileSize: fileSize,
        blog: { _id: blogId },
      });
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async saveInfoByWallpaperImageInDB(
    blogId: string,
    url: string,
    fileId: string,
    fileSize: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const createDate = new Date().toISOString();
      const newMainImage = await manager.insert(WallpaperImageForBlog, {
        url: url,
        fileId: fileId,
        createdAt: createDate,
        fileSize: fileSize,
        blog: { _id: blogId },
      });
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async subscriptionUser(blogId: string, userId: string): Promise<true | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const createdAt = new Date().toISOString();
      const code = uuidv4();

      const insertedRes = await manager
        .createQueryBuilder()
        .insert()
        .into(BlogSubscriber)
        .values({
          blogId: { _id: blogId },
          subscriber: { _id: userId },
          code: code,
          createdAt: createdAt,
          status: SubscriptionStatus.Subscribed,
        })
        .execute();
      if (insertedRes.generatedMaps.length === 0) {
        await queryRunner.commitTransaction();
        return null;
      }
      const addSubscriberCount = await manager.update(
        Blog,
        { _id: blogId },
        {
          subscribersCount: () => `subscribersCount + 1`,
        },
      );
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async unsubscribeUserToBlog(
    blogId: string,
    userId: string,
  ): Promise<true | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const createdAt = new Date().toISOString();

      const res = await manager.update(
        BlogSubscriber,
        {
          blogId: { _id: blogId },
          subscriber: { _id: userId },
        },
        {
          status: SubscriptionStatus.Unsubscribed,
          createdAt: createdAt,
          telegramId: null as any, // нужно уточнить как избежать этого
        },
      );
      if (res.affected === 0) {
        await queryRunner.commitTransaction();
        return null;
      }
      const deleteSubscriberCount = await manager.update(
        Blog,
        { _id: blogId },
        {
          subscribersCount: () => `subscribersCount - 1`,
        },
      );
      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }
  async addTelegramIdForSuscriber(
    code: string,
    telegramId: number,
  ): Promise<true | null> {
    try {
      const res = await this.dataSource
        .createQueryBuilder()
        .update(BlogSubscriber)
        .set({ telegramId: telegramId })
        .where({ code: code })
        .execute();
      if (res.affected === 0) {
        return null;
      }
      return true;
    } catch (e) {
      return null;
    }
  }

  async deleteBlogId(id: string): Promise<boolean | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const postsDeleted = await this.commandBus.execute(
        new DeletePostsByBlogIdCommand(id),
      );
      const blogDeleted = await manager.delete(Blog, {
        _id: id,
      });
      // const blogDeleted = await this.blogModel.query(`
      // DELETE FROM public."blogs" as b
      // WHERE b."_id" = $1`, [id])
      // const postDeleted = await this.blogModel.query(`
      // DELETE FROM public."posts"
      // WHERE "blogId" = $1`, [id])

      await queryRunner.commitTransaction();
      if (!blogDeleted.affected) {
        return null;
      } else {
        return true;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteBlogAll(): Promise<number> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const blogsDeleted = await manager.delete(Blog, {});
      // const blogsDelete = await this.blogModel.query(`
      // DELETE FROM public."blogs"`)
      await queryRunner.commitTransaction();
      if (!blogsDeleted.affected) return HttpStatus.NOT_FOUND;
      return HttpStatus.NO_CONTENT;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return HttpStatus.NOT_FOUND;
    } finally {
      await queryRunner.release();
    }
  }
}
