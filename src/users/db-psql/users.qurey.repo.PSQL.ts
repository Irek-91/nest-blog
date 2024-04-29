import { Blog } from './../../blogs/db-psql/entity/blog.entity';
import { bannedUsersViewModel } from './../models/users-model';
import { BannedUser } from './entity/banned.user.entity';
import {
  banStatusEnum,
  queryPaginationTypeUserSA,
} from './../../helpers/query-filter-users-SA';
import { User } from './entity/user.entity';
import { EmailConfirmation } from './entity/email.confirm.entity';
import { Injectable } from '@nestjs/common';
import {
  emailConfirmationPSQL,
  userModelPSQL,
  userViewModel,
  usersViewModel,
} from '../models/users-model';
import { InjectDataSource } from '@nestjs/typeorm';
import { Brackets, DataSource } from 'typeorm';
import { UsersBannedByBlogger } from './entity/users.banned.by.blogger.entity';

@Injectable()
export class UsersQueryRepoPSQL {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUsers(
    paginatorUser: queryPaginationTypeUserSA,
  ): Promise<usersViewModel> {
    let usersOutput: userViewModel[] = [];
    try {
      let statusFilter: null | boolean = null;
      const searchLoginTerm = paginatorUser.searchLoginTerm;
      const searchEmailTerm = paginatorUser.searchEmailTerm;

      if (paginatorUser.banStatus === banStatusEnum.banned) {
        statusFilter = true;
      }
      if (paginatorUser.banStatus === banStatusEnum.notBanned) {
        statusFilter = false;
      }

      let users: any = [];
      const filterLoginOrEmail = {};
      const filterEmail = {};
      let totalCount = 0;

      users = await this.dataSource
        .createQueryBuilder(User, 'u')
        .leftJoinAndSelect(BannedUser, 'b', 'b.userId = u._id')
        .where(
          new Brackets((qb) => {
            qb.where(
              `${
                searchLoginTerm !== null
                  ? `u.login ILIKE '%${searchLoginTerm}%'`
                  : `u.login is not null`
              }`,
            ).orWhere(
              `${
                searchEmailTerm !== null
                  ? `u.email ILIKE '%${searchEmailTerm}%'`
                  : `u.email is not null`
              }`,
            );
          }),
        )
        .andWhere(
          `${
            statusFilter !== null
              ? `u.status = ${statusFilter}`
              : 'u.status is not null'
          }`,
        )
        .orderBy(`u.${paginatorUser.sortBy}`, paginatorUser.sortDirection)
        .offset(paginatorUser.skip)
        .limit(paginatorUser.pageSize)
        .getRawMany();

      totalCount = await this.dataSource
        .createQueryBuilder(User, 'u')
        .leftJoinAndSelect(BannedUser, 'b', 'b.userId = u._id')
        .where(
          new Brackets((qb) => {
            qb.where(
              `${
                searchLoginTerm !== null
                  ? `u.login ILIKE '%${searchLoginTerm}%'`
                  : `u.login is not null`
              }`,
            ).orWhere(
              `${
                searchEmailTerm !== null
                  ? `u.email ILIKE '%${searchEmailTerm}%'`
                  : `u.email is not null`
              }`,
            );
          }),
        )
        .andWhere(
          `${
            statusFilter !== null
              ? `u.status = ${statusFilter}`
              : 'u.status is not null'
          }`,
        )
        .orderBy(`u.${paginatorUser.sortBy}`, paginatorUser.sortDirection)
        .getCount();

      usersOutput = users.map((b) => {
        return {
          id: b.u__id.toString(),
          login: b.u_login,
          email: b.u_email,
          createdAt: b.u_createdAt,
          banInfo: {
            isBanned: b.u_status,
            banDate: b.b_banDate,
            banReason: b.b_banReason,
          },
        };
      });
      return {
        pagesCount: Math.ceil(totalCount / paginatorUser.pageSize),
        page: paginatorUser.pageNumber,
        pageSize: paginatorUser.pageSize,
        totalCount: totalCount,
        items: usersOutput,
      };
    } catch (e) {
      return {
        pagesCount: 0,
        page: paginatorUser.pageNumber,
        pageSize: paginatorUser.pageSize,
        totalCount: 0,
        items: usersOutput,
      };
    }
  }

  async findUserById(userId: string): Promise<userModelPSQL | null> {
    try {
      const user = await this.dataSource
        .getRepository(User)
        .createQueryBuilder('u')
        .where('u._id = :id', { id: userId })
        .getOne();

      //query(`SELECT * FROM public."users" as u WHERE u."_id" = $1`, [userId]);

      if (!user) {
        return null;
      } else {
        return {
          _id: user._id,
          login: user.login,
          email: user.email,
          createdAt: user.createdAt,
          salt: user.salt,
          hash: user.hash,
        };
      }
    } catch (e) {
      return null;
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await this.dataSource
        .getRepository(User)
        .createQueryBuilder('u')
        .where('u._id = :id', { id: userId })
        .getOne();

      //query(`SELECT * FROM public."users" as u WHERE u."_id" = $1`, [userId]);

      if (!user) {
        return null;
      } else {
        return user;
      }
    } catch (e) {
      return null;
    }
  }

  async findByLoginOrEmailL(loginOrEmail: string): Promise<User | null> {
    try {
      const user = await this.dataSource
        .getRepository(User)
        .createQueryBuilder('u')
        .select()
        .where('u.login = :login', { login: loginOrEmail })
        .orWhere('u.email = :email', { email: loginOrEmail })
        .getOne();

      if (!user) {
        return null;
      } else {
        return user;
      }
    } catch (e) {
      return null;
    }
  }

  async findUserByCode(code: string): Promise<emailConfirmationPSQL | null> {
    try {
      const result = await this.dataSource
        .getRepository(EmailConfirmation)
        .createQueryBuilder('e')
        .select()
        .where('e.confirmationCode = :confirmationCode', {
          confirmationCode: code,
        })
        .getOne();

      if (!result) {
        return null;
      } else {
        return {
          userId: result.userId._id,
          confirmationCode: result.confirmationCode,
          expiritionDate: result.expiritionDate,
          isConfirmed: result.isConfirmed,
          recoveryCode: result.recoveryCode,
        };
      }
    } catch (e) {
      return null;
    }
  }

  async findUserByEmail(email: string): Promise<userModelPSQL | null> {
    try {
      const result = await this.dataSource
        .getRepository(User)
        .createQueryBuilder('u')
        //.select()
        .where('u.email= :email', { email: email })
        .getOne();

      if (!result) {
        return null;
      } else {
        return {
          _id: result._id.toString(),
          login: result.login,
          email: result.email,
          createdAt: result.createdAt,
          salt: result.salt,
          hash: result.hash,
        };
      }
    } catch (e) {
      return null;
    }
  }

  async getUserBannedByBlogger(
    userId: string,
  ): Promise<UsersBannedByBlogger | null> {
    try {
      const result = await this.dataSource
        .getRepository(UsersBannedByBlogger)
        .findOne({
          relations: {
            blogId: true,
            userId: true,
          },
          where: {
            userId: { _id: userId },
          },
        });

      if (!result) {
        return null;
      } else {
        return result;
      }
    } catch (e) {
      return null;
    }
  }

  async getUsersBannedByBlogId(
    blogId: string,
    paginator: queryPaginationTypeUserSA,
  ): Promise<bannedUsersViewModel> {
    try {
      const searchLoginTerm = paginator.searchLoginTerm;
      const result = await this.dataSource
        .createQueryBuilder(UsersBannedByBlogger, 'b')
        .leftJoinAndSelect(User, 'u', 'b.userId = u._id')
        .leftJoinAndSelect(Blog, 'blog', 'b.blogId = blog._id')
        .where('blog._id = :blogId', { blogId: blogId })
        .andWhere('b.banStatus = :banStatus', { banStatus: true })
        .andWhere(
          `${
            searchLoginTerm !== null
              ? `u.login ILIKE '%${searchLoginTerm}%'`
              : `u.login is not null`
          }`,
        )
        .orderBy(`u.${paginator.sortBy}`, paginator.sortDirection)
        .offset(paginator.skip)
        .limit(paginator.pageSize)
        .getRawMany();

      const totalCount = await this.dataSource
        .createQueryBuilder(UsersBannedByBlogger, 'b')
        .leftJoinAndSelect(User, 'u', 'b.userId = u._id')
        .leftJoinAndSelect(Blog, 'blog', 'b.blogId = blog._id')
        .where('blog._id = :blogId', { blogId: blogId })
        .andWhere(
          `${
            searchLoginTerm !== null
              ? `u.login ILIKE '%${searchLoginTerm}%'`
              : `u.login is not null`
          }`,
        )
        .getCount();

      if (!result) {
        return {
          pagesCount: 0,
          page: 1,
          pageSize: 10,
          totalCount: 0,
          items: [],
        };
      }
      const usersOutput = result.map((b) => {
        return {
          id: b.u__id.toString(),
          login: b.u_login,
          banInfo: {
            isBanned: b.b_banStatus,
            banDate: b.b_banDate,
            banReason: b.b_banReason,
          },
        };
      });

      return {
        pagesCount: Math.ceil(totalCount / paginator.pageSize),
        page: paginator.pageNumber,
        pageSize: paginator.pageSize,
        totalCount: totalCount,
        items: usersOutput,
      };
    } catch (e) {
      return {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      };
    }
  }

  async findUserByLogin(login: string): Promise<userModelPSQL | null> {
    try {
      const result = await this.dataSource
        .getRepository(User)
        .createQueryBuilder('u')
        //.select()
        .where('u.login = :login', { login: login })
        .getOne();

      if (!result) {
        return null;
      } else {
        return {
          _id: result._id.toString(),
          login: result.login,
          email: result.email,
          createdAt: result.createdAt,
          salt: result.salt,
          hash: result.hash,
        };
      }
    } catch (e) {
      return null;
    }
  }

  async findUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<emailConfirmationPSQL | null> {
    try {
      const user = await this.dataSource
        .getRepository(EmailConfirmation)
        .createQueryBuilder('e')
        .select()
        .where('e.recoveryCode = :recoveryCode', { recoveryCode: recoveryCode })
        .getOne();

      if (user) {
        return {
          userId: user.userId._id,
          confirmationCode: user.confirmationCode,
          expiritionDate: user.expiritionDate,
          isConfirmed: user.isConfirmed,
          recoveryCode: user.recoveryCode,
        };
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }

  async findUserByEmailConfirmation(
    userId: string,
  ): Promise<emailConfirmationPSQL | null> {
    try {
      const user = await this.dataSource
        .getRepository(EmailConfirmation)
        .createQueryBuilder('e')
        .select()
        .where('e.userId = :userId', { userId: userId })
        .getOne();

      if (user) {
        return {
          userId: user.userId._id,
          confirmationCode: user.confirmationCode,
          expiritionDate: user.expiritionDate,
          isConfirmed: user.isConfirmed,
          recoveryCode: user.recoveryCode,
        };
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }
}
