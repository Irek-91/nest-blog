import { Injectable } from '@nestjs/common';

import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesRepository {
  constructor(@InjectDataSource() private commentsModel: DataSource) {}
  async deletedLikesAll(): Promise<boolean> {
    const likesDeleted = await this.commentsModel.query(`
        DELETE FROM public."likes"
        `);
    if (likesDeleted[1] > 0) {
      return true;
    }
    return false;
  }
}
