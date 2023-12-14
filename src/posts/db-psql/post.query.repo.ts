import { HttpException } from '@nestjs/common';
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
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()

export class PostQueryRepoPSQL {
    constructor(@InjectDataSource() private postModel: DataSource

    ) { }

    async findPost(paginationQuery: QueryPaginationType, userId: string | null): Promise<paginatorPost> {
        let query = `SELECT * FROM public."posts"
                    ORDER BY "${paginationQuery.sortBy}" ${paginationQuery.sortDirection}
                    `
        const queryResult = `${query}` + ` LIMIT $1 OFFSET $2`
        const posts = await this.postModel.query(queryResult,
            [paginationQuery.pageSize, paginationQuery.skip])
        //sort([[paginationQuery.sortBy, paginationQuery.sortDirection]]).
        // skip(paginationQuery.skip).
        // limit(paginationQuery.pageSize)
        const totalCount = (await this.postModel.query(query)).length
        const pagesCount = Math.ceil(totalCount / paginationQuery.pageSize)

        const postsOutput: postOutput[] = await Promise.all(posts.map(async (b) => {
            let myStatus = 'None'
            if (userId) {
                const status = await this.postModel.query(`SELECT * FROM public."likes"
                                                            WHERE "userId" = $1 AND "postIdOrCommentId" = $2
                 `, [userId, b._id])
                if (status.length > 0) {
                    myStatus = status[0].status
                }
                //findOne({ userId, postIdOrCommentId: b._id.toString() })
                //     if (status) {
                //         myStatus = status.status
            }
            // }
        
            //likeModel.find({ postIdOrCommentId: b.id, status: 'Like' }).sort({ createdAt: -1 }).limit(3).lean()
            const likes = await this.postModel.query(`
                    SELECT * FROM public."likes"
                    WHERE "postIdOrCommentId" = $1 AND status = 'Like'
                `, [b._id])

            const likesCount = likes.length

            const dislikes = await this.postModel.query(`
                    SELECT * FROM public."likes"
                    WHERE "postIdOrCommentId" = $1 AND status = 'Dislike'
                `, [b._id])
            const dislikesCount = dislikes.length
            
            const newestLikes = await this.postModel.query(`SELECT * FROM public."likes"
                                                            WHERE "postIdOrCommentId" = $1 AND status = 'Like'
                                                            ORDER BY "createdAt" DESC
                                                            LIMIT 3
            `, [b._id])
            
            const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
                return {
                    addedAt: like.createdAt,
                    userId: like.userId,
                    login: like.userLogin
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
                    likesCount: likesCount,//await this.likeModel.countDocuments({ postIdOrCommentId: b._id.toString(), status: 'Like' }),
                    dislikesCount: dislikesCount,//await this.likeModel.countDocuments({ postIdOrCommentId: b._id.toString(), status: 'Dislike' }),
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

    async findPostsBlogId(paginationQuery: QueryPaginationType, blogId: string, userId: string | null): Promise<paginatorPost | null> {
        try {

            //const filter = { blogId: blogId }
            const queryFilter = `SELECT * FROM public."posts"
                                WHERE "blogId" = '${blogId}'
                                ORDER BY "${paginationQuery.sortBy}" ${paginationQuery.sortDirection}`
            const queryResult = `${queryFilter}` + ` LIMIT $1 OFFSET $2`
            const posts = await this.postModel.query(queryResult,
                [paginationQuery.pageSize, paginationQuery.skip])
            // .find(filter)
            // //.sort([[paginationQuery.sortBy, paginationQuery.sortDirection]])
            // .skip(paginationQuery.skip)
            // .limit(paginationQuery.pageSize)
            // .lean();

            const totalCount = (await this.postModel.query(queryFilter)).length;
            const pagesCount = Math.ceil(totalCount / (paginationQuery.pageSize))
            const postsOutput: postOutput[] = await Promise.all(posts.map(async (b) => {
                let myStatus = 'None'
                if (userId) {
                    const status = await this.postModel.query(`SELECT * FROM public."likes"
                                                            WHERE "userId" = $1 AND "postIdOrCommentId" = $2
                `, [userId, b._id])

                    if (status.length > 0) {
                        myStatus = status[0].status
                    }
                }
                // if (userId) {
                //     const status = await this.likeModel.findOne({ userId, postIdOrCommentId: b._id.toString() })
                //     if (status) {
                //         myStatus = status.status
                //     }
                // }
                const newestLikes = await this.postModel.query(`SELECT * FROM public."likes"
                                                                WHERE "postIdOrCommentId" = $1 AND status = 'Like'
                                                                ORDER BY "createdAt" DESC
                                                                LIMIT 3
                `, [b._id])
                //likeModel.find({ postIdOrCommentId: b.id, status: 'Like' }).sort({ createdAt: -1 }).limit(3).lean()
                const likes = await this.postModel.query(`
                    SELECT * FROM public."likes"
                    WHERE "postIdOrCommentId" = $1 AND status = 'Like'
                `, [b._id])

                const likesCount = likes.length

                const dislikes = await this.postModel.query(`
                    SELECT * FROM public."likes"
                    WHERE "postIdOrCommentId" = $1 AND status = 'Dislike'
                `, [b._id])
                const dislikesCount = dislikes.length
                
                const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
                    return {
                        addedAt: like.createdAt,
                        userId: like.userId,
                        login: like.userLogin
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
                        likesCount: likesCount, //await this.likeModel.countDocuments({ postIdOrCommentId: b._id.toString(), status: 'Like' }),
                        dislikesCount: dislikesCount, //await this.likeModel.countDocuments({ postIdOrCommentId: b._id.toString(), status: 'Dislike' }),
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
        } catch (e) { return null }

    }

    async getPostById(id: string): Promise<postMongoDb | null> {
        try {
            const post: postMongoDb = await this.postModel.query(`
                    SELECT * FROM public."posts"
                    WHERE "_id" = $1                        
        `, [id])
            const likes = await this.postModel.query(`
                    SELECT * FROM public."likes"
                    WHERE "postIdOrCommentId" = $1 AND status = 'Like'
        `, [id])

            const likesCount = likes.length

            const dislikes = await this.postModel.query(`
                    SELECT * FROM public."likes"
                    WHERE "postIdOrCommentId" = $1 AND status = 'Dislike'
        `, [id])
            const dislikesCount = dislikes.length

            const resultPost = {
                _id: post[0]._id,
                title: post[0].title,
                shortDescription: post[0].shortDescription,
                content: post[0].content,
                blogId: post[0].blogId,
                blogName: post[0].blogName,
                createdAt: post[0].createdAt,
                extendedLikesInfo: {
                    likesCount: likesCount,
                    dislikesCount: dislikesCount,
                    myStatus: 'None',
                    newestLikes: []
                }
            }
            return resultPost
        } catch (e) { return null }
    }


    async getPostId(id: string, userId: string | null): Promise<postOutput> {
        try {
            let post = await this.postModel.query(`
            SELECT * FROM public."posts"
            WHERE "_id" = $1`, [id])
            //findOne({ _id: new ObjectId(id) }).lean();

            if (post.length === 0) throw new HttpException('Not found', HttpStatus.NOT_FOUND)

            let myStatus = 'None'
            if (userId) {
                const status = await this.postModel.query(`SELECT * FROM public."likes"
                                                            WHERE "userId" = $1 AND "postIdOrCommentId" = $2
                `, [userId, id])
                if (status.length > 0) {
                    myStatus = status[0].status
                }
            }
            const newestLikes = await this.postModel.query(`SELECT * FROM public."likes"
                                                                WHERE "postIdOrCommentId" = $1 AND status = 'Like'
                                                                ORDER BY "createdAt" DESC
                                                                LIMIT 3
                `, [id])
            //likeModel.find({ postIdOrCommentId: b.id, status: 'Like' }).sort({ createdAt: -1 }).limit(3).lean()
            const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
                return {
                    addedAt: like.createdAt,
                    userId: like.userId,
                    login: like.userLogin
                }
            })
            const likes = await this.postModel.query(`
                    SELECT * FROM public."likes"
                    WHERE "postIdOrCommentId" = $1 AND status = 'Like'
            `, [id])

            const likesCount = likes.length

            const dislikes = await this.postModel.query(`
                    SELECT * FROM public."likes"
                    WHERE "postIdOrCommentId" = $1 AND status = 'Dislike'
            `, [id])
            const dislikesCount = dislikes.length
            // const newestLikes = await this.likeModel.find({ postIdOrCommentId: id, status: 'Like' }).sort({ createdAt: -1 }).limit(3).lean()
            // const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
            //     return {
            //         addedAt: like.createdAt,
            //         userId: like.userId,
            //login: like.userLogin
            //     }
            // })

            return {
                id: post[0]._id.toString(),
                title: post[0].title,
                shortDescription: post[0].shortDescription,
                content: post[0].content,
                blogId: post[0].blogId,
                blogName: post[0].blogName,
                createdAt: post[0].createdAt,
                extendedLikesInfo: {
                    likesCount: likesCount,//await this.likeModel.countDocuments({ postIdOrCommentId: id, status: 'Like' }),
                    dislikesCount: dislikesCount,//await this.likeModel.countDocuments({ postIdOrCommentId: id, status: 'Dislike' }),
                    myStatus: myStatus,
                    newestLikes: newestLikesMaped
                }
            }
        } catch (e) { throw new HttpException('Not found', HttpStatus.NOT_FOUND) }
    }
}
