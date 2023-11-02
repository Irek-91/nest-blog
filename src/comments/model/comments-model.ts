import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"
import { ObjectId } from "mongodb"


export class commentInput {
  
  @MaxLength(300)
  @MinLength(20)
  @IsString()
  @IsNotEmpty()
  content: string
}

export type commentViewModel = {
  id: string,
  content: string,
  commentatorInfo: {
    userId: string,
    userLogin: string
  },
  createdAt: string,
  likesInfo: {
    likesCount: number,
    dislikesCount: number,
    myStatus: string
  }
}

export type commentMongoModel = {
  _id: ObjectId,
  postId: string,
  content: string,
  commentatorInfo: {
    userId: string,
    userLogin: string
  },
  createdAt: string
}

// export type commentInputModel = {
//   postId: string,
//   content: string,
//   commentatorInfo: {
//     userId: string,
//     userLogin: string
//   },
//   createdAt: string
// }

export type likeInfoShema = {
  _id: ObjectId,
  userId: string,
  commentsId: string,
  status: string,
  createdAt: string
}
export type paginatorComments = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: commentViewModel[]
}

