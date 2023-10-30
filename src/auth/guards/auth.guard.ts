import { HttpStatus, BadRequestException } from '@nestjs/common';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class EmailOrLoginGuard implements CanActivate {
    constructor(protected usersServise: UsersService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const loginExists = await this.usersServise.findUserByLogin(req.body.login)
        const emailExists = await this.usersServise.findUserByEmail(req.body.email)
        if (loginExists !== HttpStatus.NOT_FOUND) {
            throw new BadRequestException([
                { message: 'BAD REQUEST', field: 'login' },
            ])
        }
        if (emailExists !== HttpStatus.NOT_FOUND) {
            throw new BadRequestException([
                { message: 'BAD REQUEST', field: 'email' },
            ])
        }
        return true
    }
}

@Injectable()
export class emailRegistrationGuard implements CanActivate {
    constructor(protected usersServise: UsersService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const emailExists = await this.usersServise.findUserByEmail(req.body.email)
        if (emailExists !== HttpStatus.NOT_FOUND) {
            throw new BadRequestException([
                { message: 'BAD REQUEST', field: 'email' },
            ])
        }
        return true
    }
}