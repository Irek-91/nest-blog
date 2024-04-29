// import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
// import mongoose, { HydratedDocument } from "mongoose";

// @Schema()
// export class DevicesModel {
//     _id: mongoose.Types.ObjectId;

//     @Prop({
//         required: true,
//         type: String
//     })
//     issuedAt: string;

//     @Prop({
//         required: true,
//         type: String
//     })
//     expirationDate: string;

//     @Prop({
//         required: true,
//         type: String
//     })
//     deviceId: string;

//     @Prop({
//         required: true,
//         type: String
//     })
//     IP: string;

//     @Prop({
//         required: true,
//         type: String
//     })
//     deviceName: string;

//     @Prop({
//         required: true,
//         type: String
//     })
//     userId: string
// }

// export const DevicesModelSchema = SchemaFactory.createForClass(DevicesModel);

// export type DevicesModelDocument = HydratedDocument<DevicesModel>;
