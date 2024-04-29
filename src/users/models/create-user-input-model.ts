import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatUserInputModel {
  @ApiProperty({
    maximum: 10,
    minimum: 3,
    type: String,
  })
  @MaxLength(10)
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    maximum: 20,
    minimum: 6,
    type: String,
  })
  @MaxLength(20)
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: String,
  })
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}
