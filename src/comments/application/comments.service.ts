import { UsersRepositoryPSQL } from '../../users/db-psql/users.repo.PSQL';
import { UsersQueryRepoPSQL } from '../../users/db-psql/users.qurey.repo.PSQL';
import { CommentsRepoPSQL } from '../db-psql/comments.repo.PSQL';
import { CommentsQueryRepoPSQL } from '../db-psql/comments.query.repo.PSQL';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsService {
  constructor(
    protected usersRepository: UsersRepositoryPSQL,
    protected usersQueryRepository: UsersQueryRepoPSQL,
    protected commentsRepository: CommentsRepoPSQL,
    protected commentsQueryRepository: CommentsQueryRepoPSQL,
  ) {}

  async deleteCommentsAll(): Promise<boolean> {
    return await this.commentsRepository.deletCommentsAll();
  }
}
