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

export type blogInput = {
  name: string,
  description: string,
  websiteUrl: string,
}
export type paginatorBlog = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: blogOutput[]
}

