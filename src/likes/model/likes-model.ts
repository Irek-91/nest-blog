import { IsEnum } from "class-validator";

export enum LikeStatusEnum {
    Like = 'Like',
    Dislike = 'Dislike',
    None = 'None'
  }
export class likeStatus {
    @IsEnum(LikeStatusEnum)
    likeStatus: string
}
