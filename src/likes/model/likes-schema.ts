// import mongoose, { HydratedDocument, Types } from 'mongoose';
// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// @Schema()
// export class Like {
//     _id: mongoose.Types.ObjectId;
//     @Prop({
//         required: true,
//         type: String,
//     })
//     userId: string
    
//     @Prop({
//         required: true,
//         type: String,
//     })
//     login: string
    
//     @Prop({
//         required: true,
//         type: String,
//     })
//     postIdOrCommentId: string

//     @Prop({
//         required: true,
//         type: String,
//     })
//     status: string
//     @Prop({
//         required: true,
//         type: String,
//     })
//     createdAt: string
// }

// export const LikeSchema = SchemaFactory.createForClass(Like);
// export type LikeDocument = HydratedDocument<Like>
