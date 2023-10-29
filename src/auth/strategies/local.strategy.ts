import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            usernameField: 'loginOrEmail'
        });
    }

    async validate(loginOrEmail: string, password: string): Promise<any> {
        const user = await this.usersService.checkCredentials(loginOrEmail, password);
        if (user === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.UNAUTHORIZED);
        }
        return user
    }
}