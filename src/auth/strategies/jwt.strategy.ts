import { settings } from './../../settings';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import {ExtractJwt, Strategy} from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: settings.JWT_SECRET
        });
    }
    async validate(payload: any): Promise<any> {
        return payload.userId
    }
}