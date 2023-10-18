import { HttpStatus, Injectable } from '@nestjs/common';
import { Post, PostDocument } from "./model/post-schema"
import { HydratedDocument, Model } from "mongoose"
import { QueryPaginationType } from "src/helpers/query-filter"
import { newestLikes, paginatorPost, postMongoDb, postOutput } from "./model/post-model"
import { Filter, ObjectId } from "mongodb";
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/users/models/users-schema';
import { Like, LikeDocument } from 'src/likes/model/likes-schema';

@Injectable()

export class PostRepository {
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

    async findPostsBlogId(paginationQuery: QueryPaginationType, blogId: string, userId: string| null): Promise<paginatorPost | boolean> {
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
        } catch (e) { return false }

    }

    async getPostById(id: string):Promise<HydratedDocument<postMongoDb> | null> {
        return this.postModel.findOne({_id: id})
    }

    async savePost(post: HydratedDocument<postMongoDb>) {
        await post.save()
     }



    async getPostId(id: string, userId: string | null): Promise<postOutput | number> {
        try {
            let post = await this.postModel.findOne({ _id: new ObjectId(id) }).lean();
            
            if (!post) { return HttpStatus.NOT_FOUND }
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
        } catch (e) { return HttpStatus.NOT_FOUND }
    }

    async deletePostId(id: string): Promise<Number> {
        const postInstance = await this.postModel.findOne({ _id: new ObjectId(id) })
        if (!postInstance) { return HttpStatus.NOT_FOUND }

        await postInstance.deleteOne()
        return HttpStatus.NO_CONTENT
    }


    async createdPost(newPost: postMongoDb): Promise<Number> {

        const postInstance = new this.postModel(newPost)
        await postInstance.save()

        return HttpStatus.CREATED

    }

    async updatePostId(id: string, title: string, shortDescription: string, content: string, blogId: string): Promise<boolean> {
        const postInstance = await this.postModel.findOne({ _id: new ObjectId(id) })
        if (!postInstance) return false
        postInstance.title = title
        postInstance.shortDescription = shortDescription
        postInstance.content = content
        postInstance.save()
        return true
    }

    async updateLikeStatusPostId(postId: string, userId: string, likeStatus: string): Promise<boolean | null> {
        try {
            const createdAt = (new Date()).toISOString()
            const loginResult = await this.userModel.findOne({ _id: new ObjectId(userId) })
            const login = loginResult!.accountData.login
            const resultLikeStatus = await this.likeModel.findOne({userId: userId, postIdOrCommentId: postId, status: likeStatus})
            if (resultLikeStatus) {return true}
            
            await this.likeModel.updateOne(
                { userId: userId, postIdOrCommentId: postId},
                { $set: { login: login, status: likeStatus, createdAt: new Date().toISOString() } },
                { upsert: true }
            )

            const post = await this.postModel.findOne({ _id: new ObjectId(postId) })
            
            const newestLikes = await this.likeModel.find({ postIdOrCommentId: postId, status: 'Like' })
                .sort({ createdAt: -1 })
                .limit(3)
                .lean()
            const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
                return {
                    addedAt: like.createdAt,
                    userId: like.userId,
                    login: like.login
                }
            })
            

            post!.extendedLikesInfo.newestLikes = newestLikesMaped
            
            post!.save()
            
            return true
        } catch (e) { 
            return null
         }
    }

    async deletePostAll(): Promise<boolean> {
        const postInstance = await this.postModel.deleteMany({})
        if (!postInstance) { return false }
        return true
    }
}
