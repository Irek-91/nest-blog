import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { HydratedDocument } from "mongoose";
import { newestLikes } from "./post-model";


@Schema()
export class Post {
    _id: mongoose.Types.ObjectId;
    @Prop({
        required: true,
        type: String,
    })
    title: string
    @Prop({
        required: true,
        type: String,
    })
    shortDescription: string
    @Prop({
        required: true,
        type: String,
    })
    content: string
    @Prop({
        required: true,
        type: String,
    })
    blogId: string
    @Prop({
        required: true,
        type: String,
    })
    blogName: string
    @Prop({
        required: true,
        type: String,
    })
    createdAt:string
    @Prop({
        required: true,
        type: Object,
    })
    extendedLikesInfo: {
        likesCount: number,
        dislikesCount: number,
        myStatus: string,
        newestLikes: newestLikes[]
    }

}




export const PostSchema = SchemaFactory.createForClass(Post);

export type PostDocument = HydratedDocument<Post>;



export const newestLikesShema = new mongoose.Schema({
    addedAt: { type: String, required: true },
    userId: { type: String, required: true },
    login: { type: String, required: true }
}, { _id: false })
