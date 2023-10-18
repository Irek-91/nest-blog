import { HttpCode, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Filter, ObjectId } from "mongodb";
import { log } from "console";
import { Like, LikeDocument } from "./model/likes-schema";


@Injectable()
export class LikesRepository {
    constructor (@InjectModel(Like.name) private likeModel: Model<LikeDocument>) {
        
    }
}