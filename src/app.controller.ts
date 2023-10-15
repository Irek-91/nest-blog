import { Controller, Delete, Get, HttpException, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from './users/users.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users/models/users-schema';
import { Model } from 'mongoose';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private readonly usersService: UserService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Controller('testing/all-data')
export class TestingController {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  @Delete()
  async deleteAll() {
    await this.userModel.deleteMany();
    throw new HttpException('Not Found', HttpStatus.NO_CONTENT)
  }
}
