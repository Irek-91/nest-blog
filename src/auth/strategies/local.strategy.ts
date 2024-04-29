import { UsersService } from '../../users/application/users.service';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, HttpStatus, HttpException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(loginOrEmail: string, password: string): Promise<any> {
    const user = await this.usersService.checkCredentials(
      loginOrEmail,
      password,
    );

    if (!user) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
    // if (user.status === false) {
    //     throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)
    // }
    return user;
  }
}
