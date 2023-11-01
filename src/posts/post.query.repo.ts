import { HttpException } from '@nestjs/common';
import { LikeDocument, Like } from '../likes/model/likes-schema';
import { UserDocument, User } from '../users/models/users-schema';
import { QueryPaginationType } from '../helpers/query-filter';
import { HttpStatus, Injectable } from '@nestjs/common';
import { Post, PostDocument } from "./model/post-schema"
import { HydratedDocument, Model } from "mongoose"
import { newestLikes, paginatorPost, postMongoDb, postOutput } from "./model/post-model"
import { Filter, ObjectId } from "mongodb";
import { InjectModel } from '@nestjs/mongoose';
import { log } from 'console';

@Injectable()

export class PostQueryRepository {
    constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Like.name) private likeModel: Model<LikeDocument>

    ) { }

    async findPost(paginationQuery: QueryPaginationType, userId: string | null): Promise<paginatorPost> {
        const posts = await this.postModel.find({}).
            sort([[paginationQuery.sortBy, paginationQuery.sortDirection]]).
            skip(paginationQuery.skip).
            limit(paginationQuery.pageSize)
        const totalCount = await this.postModel.countDocuments()
        const pagesCount = Math.ceil(totalCount / paginationQuery.pageSize)

        const postsOutput: postOutput[] = await Promise.all(posts.map(async (b) => {
            let myStatus = 'None'
            if (userId) {
                const status = await this.likeModel.findOne({ userId, postIdOrCommentId: b._id.toString() })
                if (status) {
                    myStatus = status.status
                }
            }
            const newestLikes = await this.likeModel.find({ postIdOrCommentId: b.id, status: 'Like' }).sort({ createdAt: -1 }).limit(3).lean()
            const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
                return {
                    addedAt: like.createdAt,
                    userId: like.userId,
                    login: like.login
                }
            })
            return {
                id: b._id.toString(),
                title: b.title,
                shortDescription: b.shortDescription,
                content: b.content,
                blogId: b.blogId,
                blogName: b.blogName,
                createdAt: b.createdAt,
                extendedLikesInfo: {
                    likesCount:  await this.likeModel.countDocuments({ postIdOrCommentId: b._id.toString(), status: 'Like' }),
                    dislikesCount: await this.likeModel.countDocuments({ postIdOrCommentId: b._id.toString(), status: 'Dislike' }),
                    myStatus: myStatus,
                    newestLikes: newestLikesMaped
                }

            }
        }))
        return {
            pagesCount: pagesCount,
            page: paginationQuery.pageNumber,
            pageSize: paginationQuery.pageSize,
            totalCount: totalCount,
            items: postsOutput
        }
    }

    async findPostsBlogId(paginationQuery: QueryPaginationType, blogId: string, userId: string| null): Promise<paginatorPost | Number> {
        try {

            const filter = { blogId: blogId }
            const posts = await this.postModel
                .find(filter)
                .sort([[paginationQuery.sortBy, paginationQuery.sortDirection]])
                .skip(paginationQuery.skip)
                .limit(paginationQuery.pageSize)
                .lean();

            const totalCount = await this.postModel.countDocuments(filter);
            const pagesCount = Math.ceil(totalCount / (paginationQuery.pageSize))
            const postsOutput: postOutput[] = await Promise.all(posts.map(async(b) => {
            let myStatus = 'None'
            if (userId) {
                const status = await this.likeModel.findOne({ userId, postId: b._id.toString() })
                if (status) {
                    myStatus = status.status
                }
            }
            const newestLikes = await this.likeModel.find({ postIdOrCommentId: b._id.toString(), status: 'Like' }).sort({ createdAt: -1 }).limit(3).lean()
            const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
                return {
                    addedAt: like.createdAt,
                    userId: like.userId,
                    login: like.login
                }
            })
                return {
                    id: b._id.toString(),
                    title: b.title,
                    shortDescription: b.shortDescription,
                    content: b.content,
                    blogId: b.blogId,
                    blogName: b.blogName,
                    createdAt: b.createdAt,
                    extendedLikesInfo: {
                        likesCount:  await this.likeModel.countDocuments({ postIdOrCommentId: b._id.toString(), status: 'Like' }),
                        dislikesCount: await this.likeModel.countDocuments({ postIdOrCommentId: b._id.toString(), status: 'Dislike' }),
                        myStatus: myStatus,
                        newestLikes: newestLikesMaped
                    }
                }
            }))

            return {
                pagesCount: pagesCount,
                page: paginationQuery.pageNumber,
                pageSize: paginationQuery.pageSize,
                totalCount: totalCount,
                items: postsOutput
            }
        } catch (e) { return HttpStatus.NOT_FOUND }

    }

    async getPostById(id: string):Promise<HydratedDocument<postMongoDb> | null> {
        return this.postModel.findOne({_id: id})
    }


    async getPostId(id: string, userId: string | null): Promise<postOutput> {
        try {
            let post = await this.postModel.findOne({ _id: new ObjectId(id) }).lean();
            
            if (!post) throw new HttpException('Not found',HttpStatus.NOT_FOUND)

            let myStatus = 'None'
            if (userId) {
                const user = await this.userModel.findOne({ _id: new ObjectId(userId) })
                const userStatus = await this.likeModel.findOne({ postIdOrCommentId: id, userId: userId })
                if (userStatus) { myStatus = userStatus.status }
            }
            const newestLikes = await this.likeModel.find({ postIdOrCommentId: id, status: 'Like' }).sort({ createdAt: -1 }).limit(3).lean()
            const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
                return {
                    addedAt: like.createdAt,
                    userId: like.userId,
                    login: like.login
                }
            })

            return {
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId,
                blogName: post.blogName,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount:  await this.likeModel.countDocuments({ postIdOrCommentId: id, status: 'Like' }),
                    dislikesCount: await this.likeModel.countDocuments({ postIdOrCommentId: id, status: 'Dislike' }),
                    myStatus: myStatus,
                    newestLikes: newestLikesMaped
                }
            }
        } catch (e) { throw new HttpException('Not found',HttpStatus.NOT_FOUND) }
    }
}
