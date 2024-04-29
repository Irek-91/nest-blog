import mongoose from 'mongoose';

export type userViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: banUserInfoViewModel;
};
export type banUserBlogViewModel = {
  id: string;
  login: string;
  banInfo: banUserInfoViewModel;
};

export type bannedUsersViewModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: banUserBlogViewModel[] | [];
};

export type banUserInfoViewModel = {
  isBanned: boolean;
  banDate: string | null;
  banReason: string | null;
};

export type usersViewModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: userViewModel[] | [];
};

export type userModelPSQL = {
  _id: string;
  login: string;
  email: string;
  createdAt: string;
  salt: string;
  hash: string;
};

export type emailConfirmationPSQL = {
  userId: string;
  confirmationCode: string;
  expiritionDate: any;
  isConfirmed: boolean;
  recoveryCode: string;
};

export type userMongoModel = {
  _id: string;
  accountData: {
    login: string;
    email: string;
    salt: string;
    hash: string;
    createdAt: string;
  };
  emailConfirmation: {
    confirmationCode: string;
    expiritionDate: any;
    isConfirmed: boolean;
    recoveryCode: string;
  };
};

export type MeViewModel = {
  login: string;
  email: string;
  userId: mongoose.Types.ObjectId | string;
};
export type userInputModel = {
  email: string;
  login: string;
  password: string;
};
