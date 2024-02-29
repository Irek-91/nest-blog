import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import mongoose from "mongoose";
import { Transform } from "class-transformer";
import { IsBLogIdExist } from "../../blogs/models/blog.decorator";
import { photoSizeViewModel } from "src/blogs/models/blogs-model";


export class postInputModel {
  //   constructor (protected blogsQueryRepository : BlogsQueryRepository) {
  // }
  @MaxLength(30)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  title: string

  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  shortDescription: string

  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  content: string

  @IsBLogIdExist()
  @IsString()
  @IsNotEmpty()
  blogId: string
}

export class postInputModelSpecific {
  @MaxLength(30)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  title: string

  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  shortDescription: string

  @MaxLength(1000)
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  content: string
}

export type newestLikes = {
  addedAt: string,
  userId: string,
  login: string
}

export type postImagesViewModel = {
  main: photoSizeViewModel[] | null
}

export type postMongoDb = {
  _id: mongoose.Types.ObjectId | string,
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
  },
  images: {
    main: photoSizeViewModel[] | []
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


export type postInputTests = {
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
  blogName: string,
  createdAt: string
}