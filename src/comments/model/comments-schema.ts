import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";



@Schema()
export class Comment {
    _id: mongoose.Types.ObjectId;
    @Prop({
        required: true,
        type: String,
    })
    postId: string
    @Prop({
        required: true,
        type: String,
    })
    content: string
    @Prop({
        required: true,
        type: String,
    })
    createdAt: string
    @Prop({
        required: true,
        type: Object,
    })
    commentatorInfo: {
        userId: String,
        userLogin: String
    }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
