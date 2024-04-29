import { ApiProperty } from '@nestjs/swagger';
import { UserOutputModel } from './user-output-model';

export class UsersOutputModel {
  @ApiProperty({
    type: Number,
  })
  pagesCount: number;
  @ApiProperty({
    type: Number,
  })
  page: number;
  @ApiProperty({
    type: Number,
  })
  pageSize: number;
  @ApiProperty({
    type: Number,
  })
  totalCount: number;

  @ApiProperty({
    type: [UserOutputModel],
    description: 'List of users',
  })
  items: UserOutputModel[];
}
