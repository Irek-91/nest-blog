import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { env } from 'process';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super();
    }
    public validate = async (username: string, password:string): Promise<boolean> => {
        if (
            env.HTTP_BASIC_USER === username &&
            env.HTTP_BASIC_PASS === password
        ) {
            return true;
        }
        throw new UnauthorizedException();
    }
}