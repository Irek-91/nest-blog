import { Injectable } from '@nestjs/common';

export type queryPaginationTypeUserSA = {
  banStatus: banStatusEnum;
  sortBy: string;
  sortDirection: 'ASC' | 'DESC';
  pageNumber: number;
  pageSize: number;
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
  skip: number;
};
export enum banStatusEnum {
  all = 'all',
  banned = 'banned',
  notBanned = 'notBanned',
}
export type queryPaginationTopUsersType = {
  sort: string[];
  pageNumber: number;
  pageSize: number;
  skip: number;
};

@Injectable()
export class PaginationUsersSa {
  getPaginationFromQueryUser = (query: any): queryPaginationTypeUserSA => {
    const defaultValuesUsers: queryPaginationTypeUserSA = {
      banStatus: banStatusEnum.all,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      pageNumber: 1,
      pageSize: 10,
      searchLoginTerm: null,
      searchEmailTerm: null,
      skip: 0,
    };

    if (
      query.banStatus === banStatusEnum.all ||
      query.banStatus === banStatusEnum.banned ||
      query.banStatus === banStatusEnum.notBanned
    ) {
      defaultValuesUsers.banStatus = query.banStatus;
    } else {
      defaultValuesUsers.banStatus = banStatusEnum.all;
    }

    if (query.sortBy === 'createdAt' || query.sortBy === 'login') {
      defaultValuesUsers.sortBy = query.sortBy;
    } else {
      defaultValuesUsers.sortBy = 'createdAt';
    }

    if (
      query.sortDirection === 'asc' ||
      query.sortDirection === 'desc' ||
      query.sortDirection === 'ASC' ||
      query.sortDirection === 'DESC'
    ) {
      defaultValuesUsers.sortDirection = query.sortDirection.toUpperCase();
    } else {
      defaultValuesUsers.sortDirection = 'DESC';
    }

    if (query.pageNumber) {
      defaultValuesUsers.pageNumber = +query.pageNumber;
    }
    if (query.pageSize) {
      defaultValuesUsers.pageSize = +query.pageSize;
    }
    if (query.searchLoginTerm) {
      defaultValuesUsers.searchLoginTerm = query.searchLoginTerm;
    }
    if (query.searchEmailTerm) {
      defaultValuesUsers.searchEmailTerm = query.searchEmailTerm;
    }
    defaultValuesUsers.skip =
      (defaultValuesUsers.pageNumber - 1) * defaultValuesUsers.pageSize;

    return defaultValuesUsers;
  };
}
