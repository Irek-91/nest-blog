import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateStatusInputModel {
  @ApiProperty({
    type: Boolean,
  })
  @IsBoolean()
  @IsNotEmpty()
  isBanned: boolean;

  @ApiProperty({
    maximum: 21,
    minimum: 6,
    type: String,
  })
  @MaxLength(21)
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  banReason: string;
}
