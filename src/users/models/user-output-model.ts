import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { banUserInfoViewModel } from './users-model';

export class UserOutputModel {

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  login: string;

  @ApiProperty({
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
  })
  createdAt: string;

  banInfo: banUserInfoViewModel;
}
