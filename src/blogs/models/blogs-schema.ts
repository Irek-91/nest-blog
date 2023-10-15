import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

@Schema()
export class Blog {
  _id: mongoose.Types.ObjectId;

  // name: { type: String, required: true },
  // description: { type: String, required: true },
  // websiteUrl: { type: String, required: true },
  // createdAt: { type: String, required: true },
  // isMembership: { type: Boolean, required: true }
  @Prop({
    required: true,
    type: String,
  })
  name: string;
  @Prop({
    required: true,
    type: String,
  })
  description: string;
  @Prop({
    required: true,
    type: String,
  })
  websiteUrl: string;
  @Prop({
    required: true,
    type: String,
  })
  createdAt: string;
  @Prop({
    required: true,
    type: Boolean,
  })
  isMembership: boolean
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

export type BlogDocument = HydratedDocument<Blog>;

