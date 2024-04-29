import { photoSizeViewModel } from './../../blogs/models/blogs-model';
import { postImagesViewModel } from './../model/post-model';
import { queryPaginationType } from '../../helpers/query-filter';
import { Injectable } from '@nestjs/common';
import { newestLikes, paginatorPost, postOutput } from '../model/post-model';
import { Brackets, DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { Like } from '../../likes/entity/likes.entity';
import { ImageForPost } from './entity/image.post.entity';

@Injectable()
export class PostQueryRepoPSQL {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findPost(
    paginationQuery: queryPaginationType,
    userId: string | null,
  ): Promise<paginatorPost | null> {
    let sortBy = `p.${paginationQuery.sortBy}`;
    if (paginationQuery.sortBy === 'blogName') {
      sortBy = `b.name`;
    }
    if (paginationQuery.sortBy === 'blogId') {
      sortBy = `b._id`;
    }

    const posts: Post[] | null = await this.dataSource
      .getRepository(Post)
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.blogId', 'b')
      .where('b.banStatus = :banStatus', { banStatus: false })
      .orderBy(sortBy, paginationQuery.sortDirection)
      .skip(paginationQuery.skip)
      .take(paginationQuery.pageSize)
      .getMany();

    if (!posts) {
      return null;
    }

    const totalCount = await this.dataSource
      .getRepository(Post)
      .createQueryBuilder()
      .getCount();

    const pagesCount = Math.ceil(totalCount / paginationQuery.pageSize);

    const postsOutput: postOutput[] = await Promise.all(
      posts.map(async (b) => {
        let myStatus = 'None';
        let main: [] | photoSizeViewModel[] = [];

        if (b.imageForPost.length !== 0) {
          main = [
            {
              url: b.imageForPost[0].urlForOriginal,
              width: 940,
              height: 432,
              fileSize: b.imageForPost[0].fileSizeForOriginal,
            },
            {
              url: b.imageForPost[0].urlForMiddle,
              width: 300,
              height: 180,
              fileSize: b.imageForPost[0].fileSizeForMiddle,
            },
            {
              url: b.imageForPost[0].urlForSmall,
              width: 149,
              height: 96,
              fileSize: b.imageForPost[0].fileSizeForSmall,
            },
          ];
        }
        const postId = b._id.toString();
        if (userId) {
          const status = await this.dataSource
            .getRepository(Like)
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.userId', 'u')
            .where('u._id = :userId', { userId: userId })
            .andWhere('u.status = :status', { status: false })
            .andWhere('l.postIdOrCommentId = :postIdOrCommentId', {
              postIdOrCommentId: postId,
            })
            .getOne();
          if (status) {
            myStatus = status.status;
          }
        }
        const likesCount = await this.dataSource
          .getRepository(Like)
          .createQueryBuilder('l')
          .leftJoinAndSelect('l.userId', 'u')
          .select()
          .where({ postIdOrCommentId: postId })
          .andWhere('l.status = :status', { status: 'Like' })
          .andWhere('u.status = :status', { status: false })
          .getCount();

        const dislikesCount = await this.dataSource
          .getRepository(Like)
          .createQueryBuilder('l')
          .leftJoinAndSelect('l.userId', 'u')
          .select()
          .where({
            postIdOrCommentId: postId,
          })
          .andWhere('l.status = :status', { status: 'Dislike' })
          .andWhere('u.status = :status', { status: false })
          .getCount();

        const newestLikes = await this.dataSource
          .getRepository(Like)
          .createQueryBuilder('l')
          .leftJoinAndSelect('l.userId', 'u')
          .where('l.status = :status', { status: 'Like' })
          .andWhere('u.status = :status', { status: false })
          .andWhere('l.postIdOrCommentId = :postIdOrCommentId', {
            postIdOrCommentId: postId,
          })
          .orderBy('l.createdAt', 'DESC')
          .take(3)
          .getMany();

        const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
          return {
            addedAt: like.createdAt,
            userId: like.userId._id,
            login: like.userId.login,
          };
        });

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
            newestLikes: newestLikesMaped,
          },
          images: {
            main: main,
          },
        };
      }),
    );
    return {
      pagesCount: pagesCount,
      page: paginationQuery.pageNumber,
      pageSize: paginationQuery.pageSize,
      totalCount: totalCount,
      items: postsOutput,
    };
  }

  async findPostsBlogId(
    paginationQuery: queryPaginationType,
    blogId: string,
    userId: string | null,
  ): Promise<paginatorPost | null> {
    try {
      const posts: Post[] | null = await this.dataSource
        .getRepository(Post)
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.blogId', 'b')
        .leftJoinAndSelect('p.imageForPost', 'image')
        .where('b._id = :id', { id: blogId })
        .andWhere('b.banStatus = :banStatus', { banStatus: false })
        .orderBy(`p.${paginationQuery.sortBy}`, paginationQuery.sortDirection)
        .skip(paginationQuery.skip)
        .take(paginationQuery.pageSize)
        .getMany();

      if (!posts) {
        return null;
      }

      const totalCount = await this.dataSource
        .getRepository(Post)
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.blogId', 'b')
        .where('b._id = :id', { id: blogId })
        .getCount();

      const pagesCount = Math.ceil(totalCount / paginationQuery.pageSize);

      const postsOutput: postOutput[] = await Promise.all(
        posts.map(async (b) => {
          let myStatus = 'None';
          const postId = b._id.toString();
          let main: [] | photoSizeViewModel[] = [];

          if (b.imageForPost.length !== 0) {
            main = [
              {
                url: b.imageForPost[0].urlForOriginal,
                width: 940,
                height: 432,
                fileSize: b.imageForPost[0].fileSizeForOriginal,
              },
              {
                url: b.imageForPost[0].urlForMiddle,
                width: 300,
                height: 180,
                fileSize: b.imageForPost[0].fileSizeForMiddle,
              },
              {
                url: b.imageForPost[0].urlForSmall,
                width: 149,
                height: 96,
                fileSize: b.imageForPost[0].fileSizeForSmall,
              },
            ];
          }

          if (userId) {
            const status = await this.dataSource
              .getRepository(Like)
              .createQueryBuilder('l')
              .leftJoinAndSelect('l.userId', 'u')
              .where('u._id = :userId', { userId: userId })
              .andWhere('u.status = :status', { status: false })
              .andWhere('l.postIdOrCommentId = :postIdOrCommentId', {
                postIdOrCommentId: postId,
              })
              .getOne();
            if (status) {
              myStatus = status.status;
            }
          }

          const newestLikes = await this.dataSource
            .getRepository(Like)
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.userId', 'u')
            .where('l.status = :status', { status: 'Like' })
            .andWhere('l.postIdOrCommentId = :postIdOrCommentId', {
              postIdOrCommentId: postId,
            })
            .andWhere('u.status = :status', { status: false })
            .orderBy('l.createdAt', 'DESC')
            .take(3)
            .getMany();

          const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
            return {
              addedAt: like.createdAt,
              userId: like.userId._id,
              login: like.userId.login,
            };
          });

          const likesCount = await this.dataSource
            .getRepository(Like)
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.userId', 'u')
            .select()
            .where({ postIdOrCommentId: postId })
            .andWhere('l.status = :status', { status: 'Like' })
            .andWhere('u.status = :status', { status: false })
            .getCount();

          const dislikesCount = await this.dataSource
            .getRepository(Like)
            .createQueryBuilder('l')
            .leftJoinAndSelect('l.userId', 'u')
            .select()
            .where({
              postIdOrCommentId: postId,
            })
            .andWhere('l.status = :status', { status: 'Dislike' })
            .andWhere('u.status = :status', { status: false })
            .getCount();

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
              newestLikes: newestLikesMaped,
            },
            images: {
              main: main,
            },
          };
        }),
      );

      return {
        pagesCount: pagesCount,
        page: paginationQuery.pageNumber,
        pageSize: paginationQuery.pageSize,
        totalCount: totalCount,
        items: postsOutput,
      };
    } catch (e) {
      return null;
    }
  }
  async getPostId(
    postId: string,
    userId: string | null,
  ): Promise<postOutput | null> {
    try {
      let main: [] | photoSizeViewModel[] = [];

      const post: Post | null = await this.dataSource
        .getRepository(Post)
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.blogId', 'b')
        .leftJoinAndSelect('b.blogger', 'u')
        .leftJoinAndSelect('p.imageForPost', 'image')
        .where('p._id = :id', { id: postId })
        .andWhere('b.banStatus = :banStatus', { banStatus: false })
        .andWhere(
          new Brackets((qb) => {
            qb.where('u.status = false').orWhere('b.blogger is null');
          }),
        )
        .getOne();

      if (!post) {
        return null;
      }
      if (post.imageForPost.length !== 0) {
        main = [
          {
            url: post.imageForPost[0].urlForOriginal,
            width: 940,
            height: 432,
            fileSize: post.imageForPost[0].fileSizeForOriginal,
          },
          {
            url: post.imageForPost[0].urlForMiddle,
            width: 300,
            height: 180,
            fileSize: post.imageForPost[0].fileSizeForMiddle,
          },
          {
            url: post.imageForPost[0].urlForSmall,
            width: 149,
            height: 96,
            fileSize: post.imageForPost[0].fileSizeForSmall,
          },
        ];
      }

      let myStatus = 'None';
      if (userId) {
        const status = await this.dataSource
          .getRepository(Like)
          .createQueryBuilder('l')
          .leftJoinAndSelect('l.userId', 'u')
          .where('u._id = :userId', { userId: userId })
          .andWhere('u.status = :status', { status: false })
          .andWhere('l.postIdOrCommentId = :postIdOrCommentId', {
            postIdOrCommentId: postId,
          })
          .getOne();
        if (status) {
          myStatus = status.status;
        }
      }

      const newestLikes = await this.dataSource
        .getRepository(Like)
        .createQueryBuilder('l')
        .leftJoinAndSelect('l.userId', 'u')
        .where({
          status: 'Like',
        })
        .andWhere('u.status = :status', { status: false })
        .andWhere('l.postIdOrCommentId = :postIdOrCommentId', {
          postIdOrCommentId: postId,
        })
        .orderBy('l.createdAt', 'DESC')
        .take(3)
        .getMany();

      const newestLikesMaped: newestLikes[] = newestLikes.map((like) => {
        return {
          addedAt: like.createdAt,
          userId: like.userId._id,
          login: like.userId.login,
        };
      });
      const likesCount = await this.dataSource
        .getRepository(Like)
        .createQueryBuilder('l')
        .leftJoinAndSelect('l.userId', 'u')
        .select()
        .where({ postIdOrCommentId: postId })
        .andWhere({
          status: 'Like',
        })
        .andWhere('u.status = :status', { status: false })
        .getCount();

      const dislikesCount = await this.dataSource
        .getRepository(Like)
        .createQueryBuilder('l')
        .leftJoinAndSelect('l.userId', 'u')
        .select()
        .where({
          postIdOrCommentId: postId,
        })
        .andWhere({
          status: 'Dislike',
        })
        .andWhere('u.status = :status', { status: false })
        .getCount();

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
          newestLikes: newestLikesMaped,
        },
        images: {
          main: main,
        },
      };
    } catch (e) {
      return null;
    }
  }

  async getImagesForPosts(postId: string): Promise<postImagesViewModel | null> {
    try {
      const res = await this.dataSource
        .getRepository(ImageForPost)
        .createQueryBuilder('image')
        .leftJoinAndSelect('image.post', 'post')
        .where('post._id = :id', { id: postId })
        .getOne();
      if (!res) {
        return null;
      }
      return {
        main: [
          {
            url: res.urlForOriginal,
            width: 940,
            height: 432,
            fileSize: res.fileSizeForOriginal,
          },
          {
            url: res.urlForMiddle,
            width: 300,
            height: 180,
            fileSize: res.fileSizeForMiddle,
          },
          {
            url: res.urlForSmall,
            width: 149,
            height: 96,
            fileSize: res.fileSizeForSmall,
          },
        ],
      };
    } catch (e) {
      return null;
    }
  }
}
