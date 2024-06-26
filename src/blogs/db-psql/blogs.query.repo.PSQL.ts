import { BlogSubscriber } from './entity/subscribers.blog.entity';
import { User } from './../../users/db-psql/entity/user.entity';
import {
  blogSAOutput,
  paginatorBlogSA,
  blogsImageWiewModel,
  photoSizeViewModel,
  SubscriptionStatus,
} from './../models/blogs-model';
import { queryPaginationType } from '../../helpers/query-filter';
import { Injectable } from '@nestjs/common';

import { blogOutput, paginatorBlog } from '../models/blogs-model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from './entity/blog.entity';

@Injectable()
export class BlogsQueryRepoPSQL {
  constructor(
    @InjectDataSource() private dataSource: DataSource, //@InjectRepository(Blog) private blogRepoTypeORM: Repository<Blog>,
  ) {}

  async findBlogs(
    pagination: queryPaginationType,
    userId: string | null,
  ): Promise<paginatorBlog> {
    const sortDirection = pagination.sortDirection;
    let wallpaper: photoSizeViewModel | null = null;
    let main: [] | photoSizeViewModel[] = [];
    let sortBy = {};

    if (pagination.sortBy === 'name') {
      sortBy = {
        name: sortDirection,
      };
    } else {
      sortBy = {
        createdAt: sortDirection,
      };
    }

    const sortByWithCollate =
      pagination.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';
    let subscriptionStatus = 'None';

    const blogsOne = await this.dataSource
      .createQueryBuilder(Blog, 'b')
      .leftJoinAndSelect('b.blogger', 'u')
      .leftJoinAndSelect('b.wallpaperImage', 'w')
      .leftJoinAndSelect('b.mainImage', 'm')
      .where('b.banStatus = :banStatus', { banStatus: false })
      .andWhere(
        `${
          pagination.searchNameTerm !== null
            ? `b.name ILIKE '%${pagination.searchNameTerm}%'`
            : `b.name is not null`
        }`,
      )
      // .andWhere('u._id = :userId', {
      //   userId: userId
      // })
      .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getMany();

    const totalCount = await this.dataSource
      .createQueryBuilder(Blog, 'b')
      .leftJoinAndSelect(User, 'u', 'u._id = b.blogger')
      .where('b.banStatus = :banStatus', { banStatus: false })
      .andWhere(
        `${
          pagination.searchNameTerm !== null
            ? `b.name ILIKE '%${pagination.searchNameTerm}%'`
            : `b.name is not null`
        }`,
      )
      // .andWhere('u._id = :userId', {
      //   userId: userId
      // })
      .getMany();

    // if (userId !== null) {
    //   blogsOne = await this.dataSource
    //     .createQueryBuilder(Blog, 'b')
    //     .leftJoinAndSelect('b.blogger', 'u')
    //     .leftJoinAndSelect('b.wallpaperImage', 'w')
    //     .leftJoinAndSelect('b.mainImage', 'm')
    //     .where('b.banStatus = :banStatus', { banStatus: false })
    //     .andWhere(`${pagination.searchNameTerm !== null ? `b.name ILIKE '%${pagination.searchNameTerm}%'` : `b.name is not null`}`)
    //     .andWhere('u._id = :userId', {
    //       userId: userId
    //     })
    //     .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
    //     .skip(pagination.skip)
    //     .take(pagination.pageSize)
    //     .getMany()

    //   totalCount = await this.dataSource
    //     .createQueryBuilder(Blog, 'b')
    //     .leftJoinAndSelect(User, "u", "u._id = b.blogger")
    //     .where('b.banStatus = :banStatus', { banStatus: false })
    //     .andWhere(`${pagination.searchNameTerm !== null ? `b.name ILIKE '%${pagination.searchNameTerm}%'` : `b.name is not null`}`)
    //     .andWhere('u._id = :userId', {
    //       userId: userId
    //     })
    //     .getMany()
    // }

    const blogsOutput: blogOutput[] = await Promise.all(
      blogsOne.map(async (b) => {
        const resStatus = await this.dataSource
          .createQueryBuilder(BlogSubscriber, 'b')
          .leftJoinAndSelect('b.subscriber', 'user')
          .leftJoinAndSelect('b.blogId', 'blog')
          .where('user._id = :userId', {
            userId: userId,
          })
          .andWhere('blog._id = :blogId', {
            blogId: b._id,
          })
          .getOne();

        resStatus !== null
          ? (subscriptionStatus = resStatus.status)
          : (subscriptionStatus = SubscriptionStatus.None);

        if (b!.wallpaperImage.length !== 0) {
          wallpaper = {
            url: b.wallpaperImage[0].url,
            width: 1028,
            height: 312,
            fileSize: b.wallpaperImage[0].fileSize,
          };
        }
        if (b!.mainImage.length !== 0) {
          main = [
            {
              url: b.mainImage[0].url,
              width: 156,
              height: 156,
              fileSize: b.mainImage[0].fileSize,
            },
          ];
        }
        return {
          id: b._id,
          name: b.name,
          description: b.description,
          websiteUrl: b.websiteUrl,
          createdAt: b.createdAt,
          isMembership: b.isMembership,
          images: {
            wallpaper: wallpaper,
            main: main,
          },
          currentUserSubscriptionStatus: subscriptionStatus,
          subscribersCount: b.subscribersCount,
        };
      }),
    );

    return {
      pagesCount: Math.ceil(totalCount.length / pagination.pageSize),
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount.length,
      items: blogsOutput,
    };
  }

  async findBlogsSA(pagination: queryPaginationType): Promise<paginatorBlogSA> {
    const sortDirection = pagination.sortDirection;
    let sortBy = {};
    if (pagination.sortBy === 'name') {
      sortBy = {
        name: sortDirection,
      };
    } else {
      sortBy = {
        createdAt: sortDirection,
      };
    }

    const blogsOne = await this.dataSource
      .createQueryBuilder(Blog, 'b')
      .leftJoinAndSelect('b.blogger', 'u')
      .where(
        `${
          pagination.searchNameTerm !== null
            ? `b.name ILIKE '%${pagination.searchNameTerm}%'`
            : `b.name is not null`
        }`,
      )
      .orderBy(`b.${pagination.sortBy}`, pagination.sortDirection)
      .skip(pagination.skip)
      .take(pagination.pageSize)
      .getMany();

    const totalCount = await this.dataSource
      .getRepository(Blog)
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.blogger', 'u')
      .where(
        `${
          pagination.searchNameTerm !== null
            ? `b.name ILIKE '%${pagination.searchNameTerm}%'`
            : `b.name is not null`
        }`,
      )
      .getMany();

    const blogsOutput: blogSAOutput[] = blogsOne.map((b) => {
      return {
        id: b._id,
        name: b.name,
        description: b.description,
        websiteUrl: b.websiteUrl,
        createdAt: b.createdAt,
        isMembership: b.isMembership,
        blogOwnerInfo: {
          userId: b.blogger._id,
          userLogin: b.blogger.login,
        },
        banInfo: {
          banDate: b.banDate,
          isBanned: b.banStatus,
        },
      };
    });
    return {
      pagesCount: Math.ceil(totalCount.length / pagination.pageSize),
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: totalCount.length,
      items: blogsOutput,
    };
  }
  async getBlogId(
    blogId: string,
    userId: string | null,
  ): Promise<blogOutput | null> {
    try {
      let subscriptionStatus = 'None';

      const blog = await this.dataSource
        .createQueryBuilder(Blog, 'b')
        .leftJoinAndSelect('b.blogger', 'u')
        .leftJoinAndSelect('b.wallpaperImage', 'w')
        .leftJoinAndSelect('b.mainImage', 'm')
        .where('b.banStatus = :banStatus', { banStatus: false })
        .andWhere({ _id: blogId })
        .getOne();

      const resStatus = await this.dataSource
        .createQueryBuilder(BlogSubscriber, 'b')
        .leftJoinAndSelect('b.subscriber', 'user')
        .leftJoinAndSelect('b.blogId', 'blog')
        .where('user._id = :userId', {
          userId: userId,
        })
        .andWhere('blog._id = :blogId', {
          blogId: blogId,
        })
        .getOne();

      resStatus !== null
        ? (subscriptionStatus = resStatus.status)
        : (subscriptionStatus = SubscriptionStatus.None);

      let wallpaper: photoSizeViewModel | null = null;
      let main: [] | photoSizeViewModel[] = [];

      if (!blog) {
        return null;
      } else {
        if (blog!.wallpaperImage.length !== 0) {
          wallpaper = {
            url: blog.wallpaperImage[0].url,
            width: 1028,
            height: 312,
            fileSize: blog.wallpaperImage[0].fileSize,
          };
        }
        if (blog!.mainImage.length !== 0) {
          main = [
            {
              url: blog.mainImage[0].url,
              width: 156,
              height: 156,
              fileSize: blog.mainImage[0].fileSize,
            },
          ];
        }
        return {
          id: blog._id.toString(),
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
          createdAt: blog.createdAt,
          isMembership: false,
          images: {
            wallpaper: wallpaper,
            main: main,
          },
          subscribersCount: blog.subscribersCount,
          currentUserSubscriptionStatus: subscriptionStatus,
        };
      }
    } catch (e) {
      return null;
    }
  }

  async getSABlogId(id: string): Promise<blogOutput | null> {
    try {
      let wallpaper: photoSizeViewModel | null = null;
      let main: [] | photoSizeViewModel[] = [];
      const blog = await this.dataSource
        .createQueryBuilder(Blog, 'b')
        .leftJoinAndSelect('b.blogger', 'u')
        .leftJoinAndSelect('b.wallpaperImage', 'w')
        .leftJoinAndSelect('b.mainImage', 'm')
        .andWhere({ _id: id })
        .getOne();

      if (!blog) {
        return null;
      } else {
        if (blog!.wallpaperImage.length !== 0) {
          wallpaper = {
            url: blog.wallpaperImage[0].url,
            width: 1028,
            height: 312,
            fileSize: blog.wallpaperImage[0].fileSize,
          };
        }
        if (blog!.mainImage.length !== 0) {
          main = [
            {
              url: blog.mainImage[0].url,
              width: 156,
              height: 156,
              fileSize: blog.mainImage[0].fileSize,
            },
          ];
        }
        return {
          id: blog._id.toString(),
          name: blog.name,
          description: blog.description,
          websiteUrl: blog.websiteUrl,
          createdAt: blog.createdAt,
          isMembership: false,
          images: {
            wallpaper: wallpaper,
            main: main,
          },
          subscribersCount: blog.subscribersCount,
          currentUserSubscriptionStatus: 'None',
        };
      }
    } catch (e) {
      return null;
    }
  }

  async getBlogNameById(id: string): Promise<string | null> {
    try {
      const blog = await this.dataSource
        .getRepository(Blog)
        .createQueryBuilder()
        .where({ _id: id })
        .getOne();
      if (!blog) {
        return null;
      }
      return blog.name;
    } catch (e) {
      return null;
    }
  }

  async getBlogDBById(id: string): Promise<Blog | null> {
    try {
      const blog = await this.dataSource
        .createQueryBuilder(Blog, 'b')
        .leftJoinAndSelect('b.blogger', 'u')
        .where({ _id: id })
        .getOne();
      if (!blog) {
        return null;
      }
      return blog;
    } catch (e) {
      return null;
    }
  }

  async getBlogsByBlogger(bloggerId: string): Promise<Blog | null> {
    try {
      const blog = await this.dataSource.getRepository(Blog).findOne({
        relations: {
          blogger: true,
        },
        where: {
          blogger: {
            _id: bloggerId,
          },
        },
      });

      if (!blog) {
        return null;
      }
      return blog;
    } catch (e) {
      return null;
    }
  }

  async getImagesByBlog(blogId: string): Promise<blogsImageWiewModel | null> {
    try {
      let wallpaper: photoSizeViewModel | null = null;
      let main: [] | photoSizeViewModel[] = [];
      const blog = await this.dataSource
        .createQueryBuilder(Blog, 'b')
        .leftJoinAndSelect('b.mainImage', 'm')
        .leftJoinAndSelect('b.wallpaperImage', 'w')
        .where({ _id: blogId })
        .getOne();

      if (!blog) {
        return null;
      }
      if (blog!.wallpaperImage.length !== 0) {
        wallpaper = {
          url: blog.wallpaperImage[0].url,
          width: 1028,
          height: 312,
          fileSize: blog.wallpaperImage[0].fileSize,
        };
      }
      if (blog!.mainImage.length !== 0) {
        main = [
          {
            url: blog.mainImage[0].url,
            width: 156,
            height: 156,
            fileSize: blog.mainImage[0].fileSize,
          },
        ];
      }
      return {
        wallpaper: wallpaper,
        main: main,
      };
    } catch (e) {
      return null;
    }
  }

  async getCodeBySubscriber(userId: string): Promise<string | null> {
    try {
      const res = await this.dataSource
        .createQueryBuilder(BlogSubscriber, 'b')
        .leftJoinAndSelect('b.subscriber', 'user')
        .leftJoinAndSelect('b.blogId', 'blog')
        .where('user._id = :userId', {
          userId: userId,
        })
        .getOne();

      return res!.code;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findSubscribersThisBlog(
    blogId: string,
  ): Promise<null | BlogSubscriber[]> {
    try {
      const res = await this.dataSource
        .createQueryBuilder(BlogSubscriber, 'b')
        .leftJoinAndSelect('b.subscriber', 'user')
        .leftJoinAndSelect('b.blogId', 'blog')
        .where('blog._id = :blogId', {
          blogId: blogId,
        })
        .getMany();
      if (!res) {
        return null;
      }
      return res;
    } catch (e) {
      return null;
    }
  }
  async checkStatusSubscriptionUser(
    blogId: string,
    userId: string,
    status: SubscriptionStatus,
  ): Promise<true | null> {
    try {
      const check = await this.dataSource
        .createQueryBuilder(BlogSubscriber, 'b')
        .leftJoinAndSelect('b.subscriber', 'user')
        .leftJoinAndSelect('b.blogId', 'blog')
        .where('user._id = :userId', {
          userId: userId,
        })
        .andWhere('blog._id = :blogId', {
          blogId: blogId,
        })
        .andWhere('b.status = :status', {
          status: status,
        })
        .getOne();

      if (check !== null) {
        return true;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
