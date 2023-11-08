import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export class IPAndURIModel {
    @Prop({
        required: true,
        type: String
    })
    IP: string;

    @Prop({
        required: true,
        type: String
    })
    URL:string;

    @Prop({
        required: true,
        type: String
    })
    date:string
}
export const IPAndURISchema = SchemaFactory.createForClass(IPAndURIModel);

export type IPAndURIDocument = HydratedDocument<IPAndURIModel>;
