import { Transform } from "class-transformer";
import { IsString, IsInt, MaxLength, IsDefined, isURL, IsOptional, IsNotEmpty, IsUrl } from "class-validator";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export type blogsCollectionsType = blogOutput[];

export type blogMongoDB = {
  _id: ObjectId,
  name: string,
  description: string,
  websiteUrl: string,
  createdAt: string,
  isMembership: boolean
}

export type blogOutput = {
  id: string,
  name: string,
  description: string,
  websiteUrl: string,
  createdAt: string,
  isMembership: boolean
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


export type paginatorBlog = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: blogOutput[]
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