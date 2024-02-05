import { HttpException } from '@nestjs/common';
import { queryPaginationType } from '../../helpers/query-filter';
import { HttpStatus, Injectable } from '@nestjs/common';
import { newestLikes, paginatorPost, postMongoDb, postOutput } from "../model/post-model"
import { log } from 'console';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { Like } from '../../likes/entity/likes.entity';

@Injectable()

export class PostQueryRepoPSQL {
    constructor(@InjectDataSource() private postModel: DataSource

    ) { }

    async findPost(paginationQuery: queryPaginationType, userId: string | null): Promise<paginatorPost | null> {
        let sortBy = `p.${paginationQuery.sortBy}`
        if (paginationQuery.sortBy === 'blogName') {
            sortBy = `b.name`
        }
        if (paginationQuery.sortBy === 'blogId') {
            sortBy = `b._id`
        }

        const posts: Post[] | null = await this.postModel.getRepository(Post)
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.blogId', 'b')
            .orderBy(sortBy, paginationQuery.sortDirection)
            .skip(paginationQuery.skip)
            .take(paginationQuery.pageSize)
            .getMany()

        if (!posts) {
            return null
        }

        const totalCount = await this.postModel.getRepository(Post)
            .createQueryBuilder()
            .getCount()

        const pagesCount = Math.ceil(totalCount / paginationQuery.pageSize)

        const postsOutput: postOutput[] = await Promise.all(posts.map(async (b) => {
            let myStatus = 'None'

            const postId = b._id.toString()
            if (userId) {
                const status = await this.postModel.getRepository(Like)
                    .createQueryBuilder('l')
                    .leftJoinAndSelect('l.userId', 'u')
                    .where('u._id = :userId', { userId: userId })
                    .andWhere('u.status = :status', { status: false })
                    .andWhere('l.postIdOrCommentId = :postIdOrCommentId', { postIdOrCommentId: postId })
                    .getOne()
                if (status) {
                    myStatus = status.status
                }
            }
            const likesCount = await this.postModel.getRepository(Like).createQueryBuilder('l')
                .leftJoinAndSelect('l.userId', 'u')
                .select()
                .where({
                    postIdOrCommentId: postId
                })
                .andWhere('u.status = :status', { status: false })
                .andWhere({
                    status: 'Like'
                })
                .getCount()

            const dislikesCount = await this.postModel.getRepository(Like).createQueryBuilder('l')
                .leftJoinAndSelect('l.userId', 'u')
                .select()
                .where({
                    postIdOrCommentId: postId
                })
                .andWhere('u.status = :status', { status: false })
                .andWhere({
                    status: 'Dislike'
                })
                .getCount()


            const newestLikes = await this.postModel.getRepository(Like)
                .createQueryBuilder('l')
                .leftJoinAndSelect('l.userId', 'u')
                .where('l.status = :status', { status: 'Like' })
                .andWhere('u.status = :status', { status: false })
                .andWhere('l.postIdOrCommentId = :postIdOrCommentId', { postIdOrCommentId: postId })
                .orderBy('l.createdAt', 'DESC')
                .take(3)
                .getMany()

            const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
                return {
                    addedAt: like.createdAt,
                    userId: like.userId._id,
                    login: like.userId.login
                }
            })

            return {
                id: b._id.toString(),
                title: b.title,
                shortDescription: b.shortDescription,
                content: b.content,
                blogId: b.blogId._id,
                blogName: b.blogId.name,
                createdAt: b.createdAt,
                extendedLikesInfo: {
                    likesCount: likesCount,
                    dislikesCount: dislikesCount,
                    myStatus: myStatus,
                    newestLikes: newestLikesMaped
                }

            }
        }
        ))
        return {
            pagesCount: pagesCount,
            page: paginationQuery.pageNumber,
            pageSize: paginationQuery.pageSize,
            totalCount: totalCount,
            items: postsOutput
        }
    }

    async findPostsBlogId(paginationQuery: queryPaginationType, blogId: string, userId: string | null): Promise<paginatorPost | null> {
        try {
            const posts: Post[] | null = await this.postModel.getRepository(Post)
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.blogId', 'b')
                .where('b._id = :id', { id: blogId })
                .orderBy(`p.${paginationQuery.sortBy}`, paginationQuery.sortDirection)
                .skip(paginationQuery.skip)
                .take(paginationQuery.pageSize)
                .getMany()

            if (!posts) {
                return null
            }

            const totalCount = await this.postModel.getRepository(Post)
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.blogId', 'b')
                .where('b._id = :id', { id: blogId })
                .getCount()


            const pagesCount = Math.ceil(totalCount / (paginationQuery.pageSize))


            const postsOutput: postOutput[] = await Promise.all(posts.map(async (b) => {
                let myStatus = 'None'
                const postId = b._id.toString()

                if (userId) {
                    const status = await this.postModel.getRepository(Like)
                        .createQueryBuilder('l')
                        .leftJoinAndSelect('l.userId', 'u')
                        .where('u._id = :userId', { userId: userId })
                        .andWhere('u.status = :status', { status: false })
                        .andWhere('l.postIdOrCommentId = :postIdOrCommentId', { postIdOrCommentId: postId })
                        .getOne()
                    if (status) {
                        myStatus = status.status
                    }
                }

                const newestLikes = await this.postModel.getRepository(Like)
                    .createQueryBuilder('l')
                    .leftJoinAndSelect('l.userId', 'u')
                    .where('l.status = :status', { status: 'Like' })
                    .andWhere('l.postIdOrCommentId = :postIdOrCommentId', { postIdOrCommentId: postId })
                    .andWhere('u.status = :status', { status: false })
                    .orderBy('l.createdAt', 'DESC')
                    .take(3)
                    .getMany()

                const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
                    return {
                        addedAt: like.createdAt,
                        userId: like.userId._id,
                        login: like.userId.login
                    }
                })

                const likesCount = await this.postModel.getRepository(Like).createQueryBuilder('l')
                    .leftJoinAndSelect('l.userId', 'u')
                    .select()
                    .where({
                        postIdOrCommentId: postId
                    })
                    .andWhere('u.status = :status', { status: false })
                    .andWhere({
                        status: 'Like'
                    })
                    .getCount()

                const dislikesCount = await this.postModel.getRepository(Like).createQueryBuilder('l')
                    .leftJoinAndSelect('l.userId', 'u')
                    .select()
                    .where({
                        postIdOrCommentId: postId
                    })
                    .andWhere('u.status = :status', { status: false })
                    .andWhere({
                        status: 'Dislike'
                    })
                    .getCount()


                return {
                    id: b._id.toString(),
                    title: b.title,
                    shortDescription: b.shortDescription,
                    content: b.content,
                    blogId: b.blogId._id,
                    blogName: b.blogId.name,
                    createdAt: b.createdAt,
                    extendedLikesInfo: {
                        likesCount: likesCount,
                        dislikesCount: dislikesCount,
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
            const post: Post | null = await this.postModel.getRepository(Post)
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.blogId', 'b')
                .where('p._id = :id', { id: id })
                .getOne()
            if (!post) {
                return null
            }

            const likesCount = await this.postModel.getRepository(Like).createQueryBuilder('l')
                .leftJoinAndSelect('l.userId', 'u')
                .select()
                .where({
                    postIdOrCommentId: id
                })
                .andWhere('u.status = :status', { status: false })
                .andWhere({
                    status: 'Like'
                })
                .getCount()

            const dislikesCount = await this.postModel.getRepository(Like).createQueryBuilder('l')
                .leftJoinAndSelect('l.userId', 'u')
                .select()
                .where({
                    postIdOrCommentId: id
                })
                .andWhere('u.status = :status', { status: false })
                .andWhere({
                    status: 'Dislike'
                })
                .getCount()

            const resultPost = {
                _id: post._id,
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId._id,
                blogName: post.blogId.name,
                createdAt: post.createdAt,
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


    async getPostId(postId: string, userId: string | null): Promise<postOutput | null> {
        try {
            const post: Post | null = await this.postModel.getRepository(Post)
                .createQueryBuilder('p')
                .leftJoinAndSelect('p.blogId', 'b')
                .where('p._id = :id', { id: postId })
                .getOne()
            if (!post) {
                return null
            }

            let myStatus = 'None'
            if (userId) {
                const status = await this.postModel.getRepository(Like)
                    .createQueryBuilder('l')
                    .leftJoinAndSelect('l.userId', 'u')
                    .where('u._id = :userId', { userId: userId })
                    .andWhere('u.status = :status', { status: false })
                    .andWhere('l.postIdOrCommentId = :postIdOrCommentId', { postIdOrCommentId: postId })
                    .getOne()
                if (status) {
                    myStatus = status.status
                }
            }

            const newestLikes = await this.postModel.getRepository(Like)
                .createQueryBuilder('l')
                .leftJoinAndSelect('l.userId', 'u')
                .where('l.status = :status', { status: 'Like' })
                .andWhere('u.status = :status', { status: false })
                .andWhere('l.postIdOrCommentId = :postIdOrCommentId', { postIdOrCommentId: postId })
                .orderBy('l.createdAt', 'DESC')
                .take(3)
                .getMany()

            const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
                return {
                    addedAt: like.createdAt,
                    userId: like.userId._id,
                    login: like.userId.login
                }
            })
            const likesCount = await this.postModel.getRepository(Like).createQueryBuilder('l')
                .leftJoinAndSelect('l.userId', 'u')
                .select()
                .where({
                    postIdOrCommentId: postId
                })
                .andWhere('u.status = :status', { status: false })
                .andWhere({
                    status: 'Like'
                })
                .getCount()

            const dislikesCount = await this.postModel.getRepository(Like).createQueryBuilder('l')
                .leftJoinAndSelect('l.userId', 'u')
                .select()
                .where({
                    postIdOrCommentId: postId
                })
                .andWhere('u.status = :status', { status: false })
                .andWhere({
                    status: 'Dislike'
                })
                .getCount()

            return {
                id: post._id.toString(),
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
                blogId: post.blogId._id,
                blogName: post.blogId.name,
                createdAt: post.createdAt,
                extendedLikesInfo: {
                    likesCount: likesCount,
                    dislikesCount: dislikesCount,
                    myStatus: myStatus,
                    newestLikes: newestLikesMaped
                }
            }
        } catch (e) { throw new HttpException('Not found', HttpStatus.NOT_FOUND) }
    }
}
