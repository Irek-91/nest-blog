import { LikeDocument, Like } from '../../likes/model/likes-schema';
import { UserDocument, User } from '../../users/models/users-schema';
import { QueryPaginationType } from '../../helpers/query-filter';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Post, PostDocument } from "../model/post-schema"
import { HydratedDocument, Model } from "mongoose"
import { newestLikes, paginatorPost, postMongoDb, postOutput } from "../model/post-model"
import { Filter, ObjectId } from "mongodb";
import { InjectModel } from '@nestjs/mongoose';
import { log } from 'console';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()

export class PostRepoPSQL {
    constructor(@InjectDataSource() private postModel: DataSource

    ) { }

    
    async savePost(post: HydratedDocument<postMongoDb>) {
        await post.save()
     }

    async deletePostId(id: string): Promise<Boolean | null> {
        const postDelete = await this.postModel.query(`
        DELETE FROM public."Posts"
	    WHERE "_id" = $1
        `, [id])
        //findOne({ _id: new ObjectId(id) })
        if (postDelete[1] > 0) { return true}
        else {return null}
    }


    async createdPost(newPost: postMongoDb): Promise<true | null> {
        try {
        const postCreated = await this.postModel.query(`
            INSERT INTO public."Posts"(
            _id, title, "shortDescription", content, "blogId", "blogName", "createdAt")
            VALUES ('${newPost._id}', '${newPost.title}', '${newPost.shortDescription}',
                    '${newPost.content}', '${newPost.blogId}', '${newPost.blogName}', '${newPost.createdAt}')
        `)
        return true
        }
        catch (e) {
            return null
        }

    }

    async updatePostId(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
        try {
        const postUpdate = await this.postModel.query(`
        UPDATE public."Posts"
	    SET title=${title}, "shortDescription"=${shortDescription}, content=${content}
	    WHERE "_id" = $1
        `, [id])
        
        // findOne({ _id: new ObjectId(id) })
        // if (!postInstance) return false
        // postInstance.title = title
        // postInstance.shortDescription = shortDescription
        // postInstance.content = content
        // postInstance.save()
        return true
        } catch (e) {return false}
    }

    async updateLikeStatusPostId(postId: string, userId: string, likeStatus: string): Promise<boolean | null> {
        try {
            // const createdAt = (new Date()).toISOString()
            // const loginResult = await this.userModel.findOne({ _id: new ObjectId(userId) })
            // const login = loginResult!.accountData.login
            // const resultLikeStatus = await this.likeModel.findOne({userId: userId, postIdOrCommentId: postId, status: likeStatus})
            // if (resultLikeStatus) {return true}
            
            // await this.likeModel.updateOne(
            //     { userId: userId, postIdOrCommentId: postId},
            //     { $set: { login: login, status: likeStatus, createdAt: new Date().toISOString() } },
            //     { upsert: true }
            // )

            // const post = await this.postModel.findOne({ _id: new ObjectId(postId) })
            
            // const newestLikes = await this.likeModel.find({ postIdOrCommentId: postId, status: 'Like' })
            //     .sort({ createdAt: -1 })
            //     .limit(3)
            //     .lean()
            // const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
            //     return {
            //         addedAt: like.createdAt,
            //         userId: like.userId,
            //         login: like.login
            //     }
            // })
            

            // post!.extendedLikesInfo.newestLikes = newestLikesMaped
            
            // post!.save()
            
            return true
        } catch (e) { 
            return null
         }
    }

    async deletePostAll(): Promise<boolean> {
        const postsDeleted = await this.postModel.query(`
        DELETE FROM public."Posts"
        `)
        if (postsDeleted[1] > 0) { return true }
        return false
    }
}
