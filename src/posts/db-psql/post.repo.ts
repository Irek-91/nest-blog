import { ImageForPost } from './entity/image.post.entity';
import { Like } from './../../likes/entity/likes.entity';
import { HttpStatus, Injectable } from '@nestjs/common';
import mongoose, { HydratedDocument, Model } from "mongoose"
import { newestLikes, paginatorPost, postMongoDb, postOutput } from "../model/post-model"
import { Filter, ObjectId } from "mongodb";
import { InjectModel } from '@nestjs/mongoose';
import { log } from 'console';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Post } from './entity/post.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()

export class PostRepoPSQL {
    constructor(@InjectDataSource() private dataSource: DataSource,


    ) { }


    async savePost(post: HydratedDocument<postMongoDb>) {
        await post.save()
    }

    async createdPost(newPost: postMongoDb): Promise<true | null> {
        try {
            const postCreated = await this.dataSource.createQueryBuilder()
                .insert()
                .into(Post)
                .values({
                    _id: newPost._id.toString(),
                    title: newPost.title,
                    shortDescription: newPost.shortDescription,
                    content: newPost.content,
                    blogId: { _id: newPost.blogId },
                    createdAt: newPost.createdAt
                })
                .execute()
          
            if (postCreated.identifiers.length > 0) {
                return true
            } else {
                return null
            }
        }
        catch (e) {
            return null
        }

    }

    async updatePostId(id: string | ObjectId, title: string, shortDescription: string, content: string): Promise<boolean> {
        try {

            const postUpdate = await this.dataSource.createQueryBuilder()
                .update(Post)
                .set({
                    title: title,
                    shortDescription: shortDescription,
                    content: content
                })
                .where({
                    _id: id
                })
                .execute()

            return true
        } catch (e) { return false }
    }

    async updateLikeStatusPostId(postId: string, userId: string, likeStatus: string): Promise<true | null> {
        try {
            const createdAt = (new Date()).toISOString()

            const status = await this.dataSource.getRepository(Like)
                .createQueryBuilder('l')
                .leftJoinAndSelect('l.userId', 'u')
                .where('u._id = :userId', { userId: userId })
                .andWhere('l.postIdOrCommentId = :postIdOrCommentId', { postIdOrCommentId: postId })
                .getOne()

            if (status) {
                const likeResult = await this.dataSource
                    .createQueryBuilder()
                    .update(Like)
                    .set({
                        status: likeStatus, createdAt: createdAt
                    })
                    .where({ userId: userId })
                    .andWhere({ postIdOrCommentId: postId })
                    .execute()
   
                if (!likeResult) { return null }
                return true
            } else {
                const likeId = uuidv4()

                const likeResult = await this.dataSource.createQueryBuilder()
                    .insert()
                    .into(Like)
                    .values({
                        _id: likeId,
                        userId: { _id: userId },
                        postIdOrCommentId: postId,
                        status: likeStatus,
                        createdAt: createdAt
                    })
                    .execute()

                return true
            }
        } catch (e) {
            return null
        }
    }

    async saveInfoByImageInDB(postId: string, url: string, fileId: string, fileSize: number) {
        const queryRunner = this.dataSource.createQueryRunner()
        const manager = queryRunner.manager
        await queryRunner.connect()
    
        await queryRunner.startTransaction()
        try {
          const createDate = new Date().toISOString()
            const newMainImage = await manager.insert(ImageForPost, {
              urlForOriginal: url,
              urlForMiddle: '',
              urlForSmall: '',
              fileId: fileId,
              fileSizeForOriginal: fileSize,
              fileSizeForMiddle: 0,
              fileSizeForSmall: 0,
              createdAt: createDate,
              post: {_id: postId}
            })
            await queryRunner.commitTransaction()
            return true
          
        } catch (e) {
          await queryRunner.rollbackTransaction()
          return null
        } finally {
          await queryRunner.release()
        }
    
      }


    async deletePostAll(): Promise<boolean> {
        const postsDeleted = await this.dataSource.query(`
        DELETE FROM public."posts"
        `)
        if (postsDeleted[1] > 0) { return true }
        return false
    }

    async deletePostId(id: string): Promise<Boolean | null> {
        const likesByPostId = await this.dataSource.createQueryBuilder()
            .delete()
            .from(Like)
            .where({
                postIdOrCommentId: id
            }).execute()

        const postDelete = await this.dataSource.createQueryBuilder()
            .delete()
            .from(Post)
            .where({
                _id: id
            })
            .execute()

        if (!postDelete.affected) { return null }
        else { return true }
    }

    async deletePostsByBlogId(blogId: string): Promise<Boolean | null> {
        const postsDeleted = await this.dataSource.createQueryBuilder()
            .delete()
            .from(Post)
            .where({
                blogId: blogId
            })
            .execute()

        if (!postsDeleted.affected) { return null }
        else { return true }
    }


}
