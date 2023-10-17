import { ObjectId } from "mongodb";
import mongoose from "mongoose";


export type postInputModel = {
  title: string,
  shortDescription: string,
  content: string,
  blogId: string,
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
  _id: ObjectId,
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
