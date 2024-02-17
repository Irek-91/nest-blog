import { Transform } from "class-transformer";
import { IsString, IsInt, MaxLength, IsDefined, isURL, IsOptional, IsNotEmpty, IsUrl, IsBoolean } from "class-validator";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export type blogsCollectionsType = blogOutput[];

export type blogMongoDB = {
  _id: ObjectId | string,
  name: string,
  description: string,
  websiteUrl: string,
  createdAt: string,
  isMembership: boolean
}

export type blogPSQLDB = {
  _id: string,
  name: string,
  description: string,
  websiteUrl: string,
  createdAt: string,
  isMembership: boolean,
  postId: [] | null
  userId: string | null,
  userLogin: string | null,

}

export type blogOutput = {
  id: string,
  name: string,
  description: string,
  websiteUrl: string,
  createdAt: string,
  isMembership: boolean
}

export type blogSAOutput = {
  id: string,
  name: string,
  description: string,
  websiteUrl: string,
  createdAt: string,
  isMembership: boolean,
  blogOwnerInfo : {
    userId :string,
    userLogin: string
  },
  banInfo: {
    isBanned: boolean,
    banDate: string
  }
}

export class blogInput {
  //@IsDefined()

  @MaxLength(15)
  @IsString()
  @Transform(({value}) => value?.trim())
  @IsNotEmpty()
  name: string;

  @MaxLength(500)
  @IsString()
  @Transform(({value}) => value?.trim())
  @IsNotEmpty()
  description: string;

  @MaxLength(100)
  @IsString()
  @IsUrl(undefined, {message: 'URL is not valid'})
  websiteUrl: string
}

export class banBlogInput {
  @IsBoolean()
  isBanned: boolean
}


export type paginatorBlog = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: blogOutput[]
}

export type paginatorBlogSA = {
  pagesCount: number,
  page: number,
  pageSize: number,
  totalCount: number,
  items: blogSAOutput[]
}


// export class Model {
//   @IsString()
//   name: string

//   @IsEmail()
//   email: string
// }

// export class ModelWithId extends Model{
//   @IsUUID()
//   id: string

//   constructor(id: string, mod: Model) {
//       super();
//       this.id = id;

//       for (const [key, value] of Object.entries(mod)) {
//           this[key] = value;
//       }
//   }
// }