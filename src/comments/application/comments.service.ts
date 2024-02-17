import { UsersRepositoryPSQL } from '../../users/db-psql/users.repo.PSQL';
import { UsersQueryRepoPSQL } from '../../users/db-psql/users.qurey.repo.PSQL';
import { CommentsRepoPSQL } from '../db-psql/comments.repo.PSQL';
import { CommentsQueryRepoPSQL } from '../db-psql/comments.query.repo.PSQL';
import { queryPaginationType } from '../../helpers/query-filter';
import { Injectable, HttpStatus } from '@nestjs/common';
import { commentViewModel, paginatorComments } from '../model/comments-model';


@Injectable()

export class CommentsService {
    constructor(protected usersRepository: UsersRepositoryPSQL, 
        protected usersQueryRepository:UsersQueryRepoPSQL, 
        protected commentsRepository: CommentsRepoPSQL,
        protected commentsQueryRepository: CommentsQueryRepoPSQL) { }

    async deleteCommentsAll(): Promise<boolean> {
        return await this.commentsRepository.deletCommentsAll()
    }
}