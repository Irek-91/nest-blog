import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import mongoose from "mongoose";


export class postInputModel {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)  
  title: string

  @IsNotEmpty()
  @IsString()
  @MaxLength(100) 
  shortDescription: string
  
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string

  @IsNotEmpty()
  @IsString()
  blogId: string
}

export type postInputModelSpecific = {
  title: string,
  shortDescription: string,
  content: string,
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
