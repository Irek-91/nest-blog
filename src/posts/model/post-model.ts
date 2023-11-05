import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import mongoose from "mongoose";


export class postInputModel {
  @MaxLength(30)
  @IsString()
  @IsNotEmpty()
  title: string

  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  shortDescription: string

  @MaxLength(1000)
  @IsString()
  @IsNotEmpty()
  content: string

  @IsString()
  @IsNotEmpty()
  blogId: string
}

export class postInputModelSpecific {
  @MaxLength(30)
  @IsString()
  @IsNotEmpty()
  title: string

  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  shortDescription: string
  
  @MaxLength(1000)
  @IsString()
  @IsNotEmpty()
  content: string
}

export type newestLikes = {
  addedAt: string,
  userId: string,
  login: string
}


export type postMongoDb = {
  _id: mongoose.Types.ObjectId,
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
  blogName: string,
  createdAt: string,
  extendedLikesInfo: {
    likesCount: number,
    dislikesCount: number,
    myStatus: string,
    newestLikes: newestLikes[]
  }
};

export type postOutput = {
  id: string,
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
  blogName: string,
  createdAt: string,
  extendedLikesInfo: {
    likesCount: number,
    dislikesCount: number,
    myStatus: string,
    newestLikes: newestLikes[]
  }
}
export type postsCollectionsType = postOutput[];
export type paginatorPost = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: postOutput[]
}
