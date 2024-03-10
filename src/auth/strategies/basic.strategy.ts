import { settings } from './../../settings';
import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super();
    }
    public validate = async (username: string, password:string): Promise<boolean> => {
        if (
            settings.HTTP_BASIC_USER === username &&
            settings.HTTP_BASIC_PASS === password
        ) {
            return true;
        }
        throw new UnauthorizedException();
    }
}