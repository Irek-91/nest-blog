import { Like } from './../../likes/entity/likes.entity';
import { Device } from './../../securityDevices/db-psql/entity/devices.entity';
import { User } from './entity/user.entity';
import { Injectable } from '@nestjs/common';
import { userMongoModel, userViewModel } from '../models/users-model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { EmailConfirmation } from './entity/email.confirm.entity';
import { BannedUser } from './entity/banned.user.entity';
import { UsersBannedByBlogger } from './entity/users.banned.by.blogger.entity';

@Injectable()
export class UsersRepositoryPSQL {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createUser(newUser: userMongoModel): Promise<userViewModel | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userId = newUser._id.toString();

      const createUser = await manager.insert(User, {
        login: newUser.accountData.login,
        email: newUser.accountData.email,
        salt: newUser.accountData.salt,
        hash: newUser.accountData.hash,
        createdAt: newUser.accountData.createdAt,
        _id: newUser._id.toString(),
        status: false,
      });

      const createUserBanTable = await manager.insert(BannedUser, {
        userId: { _id: newUser._id },
      });

      const createEmailByUser = await manager.insert(EmailConfirmation, {
        confirmationCode: newUser.emailConfirmation.confirmationCode,
        expiritionDate: newUser.emailConfirmation.expiritionDate,
        isConfirmed: newUser.emailConfirmation.isConfirmed,
        recoveryCode: newUser.emailConfirmation.recoveryCode,
        userId: { _id: newUser._id },
      });

      const user: userViewModel = {
        id: newUser._id.toString(),
        login: newUser.accountData!.login,
        email: newUser.accountData!.email,
        createdAt: newUser.accountData!.createdAt,
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      };
      await queryRunner.commitTransaction();
      return user;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      queryRunner.release();
    }
  }

  async deleteUserId(userId: string): Promise<true | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const deletedUsersBannedByBlogger = await manager.delete(
        UsersBannedByBlogger,
        { userId: userId },
      );
      const deletedUsersBan = await manager.delete(BannedUser, {
        userId: userId,
      });

      const deletedUserEmail = await manager.delete(EmailConfirmation, {
        userId: userId,
      });

      const deletedUserBan = await manager.delete(BannedUser, {
        userId: userId,
      });

      const deletedUserDevice = await manager.delete(Device, {
        userId: userId,
      });

      const deletedUserLikes = await manager.delete(Like, { userId: userId });

      const deletedUser = await manager.delete(User, { _id: userId });

      if (deletedUserEmail.affected === 0 || deletedUser.affected === 0) {
        await queryRunner.commitTransaction();
        return null;
      } else {
        await queryRunner.commitTransaction();
        return true;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteUsers(): Promise<true | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const deletedUsersBannedByBlogger = await manager.delete(
        UsersBannedByBlogger,
        {},
      );

      const deletedUsersEmail = await manager.delete(EmailConfirmation, {});

      const deletedUsersBan = await manager.delete(BannedUser, {});

      const deletedDevices = await manager.delete(Device, {});

      const deletedLikes = await manager.delete(Like, {});

      const deletedUsers = await manager.delete(User, {});

      if (deletedUsersEmail.affected === 0 || deletedUsers.affected === 0) {
        await queryRunner.commitTransaction();
        return null;
      } else {
        await queryRunner.commitTransaction();
        return true;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async updateConfirmation(_id: string): Promise<true | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const resultUpdateConfirmation = await manager
        .createQueryBuilder()
        .update(EmailConfirmation)
        .set({
          confirmationCode: null,
          expiritionDate: null,
          isConfirmed: true,
        })
        .where({ userId: _id })
        .execute();
      if (!resultUpdateConfirmation) {
        await queryRunner.commitTransaction();
        return null;
      } else {
        await queryRunner.commitTransaction();
        return true;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async updateCode(
    _id: string,
    code: string,
    expiritionDate: Date,
  ): Promise<true | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const resultUpdateCode = await manager
        .createQueryBuilder()
        .update(EmailConfirmation)
        .set({ confirmationCode: code, expiritionDate: expiritionDate })
        .where({ userId: _id })
        .execute();
      if (!resultUpdateCode) {
        await queryRunner.commitTransaction();
        return null;
      } else {
        await queryRunner.commitTransaction();
        return true;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async updatePassword(
    _id: string,
    salt: string,
    hash: string,
  ): Promise<true | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const resultUpdatePassword = await manager
        .createQueryBuilder()
        .update(User)
        .set({ salt: salt, hash: hash })
        .where({ _id: _id })
        .execute();
      if (!resultUpdatePassword) {
        await queryRunner.commitTransaction();
        return null;
      } else {
        await queryRunner.commitTransaction();
        return true;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async updateRecoveryCode(
    _id: string,
    recoveryCode: string,
  ): Promise<true | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const resultUpdateCode = await manager
        .createQueryBuilder()
        .update(EmailConfirmation)
        .set({ recoveryCode: recoveryCode })
        .where({ userId: _id })
        .execute();
      if (!resultUpdateCode) {
        await queryRunner.commitTransaction();
        return null;
      } else {
        await queryRunner.commitTransaction();
        return true;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatusUser(
    userId: string,
    isBanned: boolean,
    banReason: string | null,
    banDate: string | null,
  ): Promise<User | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const resultUpdateUser = await manager
        .createQueryBuilder()
        .update(User)
        .set({ status: isBanned })
        .where({ _id: userId })
        .execute();

      const user = await manager
        .getRepository(User)
        .createQueryBuilder('u')
        .where('u._id = :id', { id: userId })
        .getOne();

      const resultUpdateReason = await manager
        .createQueryBuilder()
        .update(BannedUser)
        .set({
          banReason: banReason,
          banDate: banDate,
        })
        .where({ userId: userId })
        .execute();

      if (!resultUpdateUser) {
        await queryRunner.commitTransaction();
        return null;
      } else {
        await queryRunner.commitTransaction();
        return user;
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async banUserByBlog(
    banUserId: string,
    blogId: string,
    isBanned: boolean,
    banReason: string,
    banDate: string,
  ): Promise<null | boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    const manager = queryRunner.manager;
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const banUser = await manager
        .getRepository(UsersBannedByBlogger)
        .findOne({
          relations: {
            userId: true,
            blogId: true,
          },
          where: {
            userId: { _id: banUserId },
            blogId: { _id: blogId },
          },
        });

      if (!banUser) {
        const resultUpdate = await manager
          .createQueryBuilder()
          .insert()
          .into(UsersBannedByBlogger)
          .values({
            userId: { _id: banUserId },
            blogId: { _id: blogId },
            banDate: banDate,
            banReason: banReason,
            banStatus: isBanned,
          })
          .execute();
      } else {
        if (isBanned === false) {
          const resultUpdate = await manager
            .getRepository(UsersBannedByBlogger)
            .delete({
              userId: { _id: banUserId },
              blogId: { _id: blogId },
            });
        }
        const resultUpdate = await manager
          .getRepository(UsersBannedByBlogger)
          .update(
            {
              userId: { _id: banUserId },
              blogId: { _id: blogId },
            },
            {
              banDate: banDate,
              banReason: banReason,
              banStatus: isBanned,
            },
          );
      }

      await queryRunner.commitTransaction();
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return null;
    } finally {
      await queryRunner.release();
    }
  }
}
