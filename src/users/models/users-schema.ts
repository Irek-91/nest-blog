// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose, { HydratedDocument, Types } from 'mongoose';

// @Schema()
// export class User {
//   // @Prop({
//   //   required: true,
//   //   type: mongoose.Types.ObjectId,
//   // })
//   _id: mongoose.Types.ObjectId;

//   @Prop({
//     required: true,
//     type: Object,
//   })
//   accountData: {
//     login: string;
//     email: string;
//     salt: string;
//     hash: string;
//     createdAt: string;
//   };

//   @Prop({
//     required: true,
//     type: Object,
//   })
//   emailConfirmation: {
//     confirmationCode: string;
//     expiritionDate: any;
//     isConfirmed: boolean;
//     recoveryCode: string;
//   };
// }

// export const UserSchema = SchemaFactory.createForClass(User);

// export type UserDocument = HydratedDocument<User>;
