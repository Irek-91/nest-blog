import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class BanUserByBloggerInputModel {
  @ApiProperty({
    type: Boolean,
  })
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @ApiProperty({
    minimum: 20,
    type: String,
  })
  @MinLength(20)
  @IsString()
  @IsNotEmpty()
  banReason: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  blogId: string;
}
