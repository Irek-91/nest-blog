import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

@Schema()
export class TokenExpiration  {
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
  refreshToken: string;

}

export const TokenExpirationSchema = SchemaFactory.createForClass(TokenExpiration);

export type TokenExpirationDocument = HydratedDocument<TokenExpiration>;

