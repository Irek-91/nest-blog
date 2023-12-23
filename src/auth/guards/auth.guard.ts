import { UsersService } from './../../users/users.service';
import { HttpStatus, BadRequestException } from '@nestjs/common';
import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { log } from 'console';
import { addSeconds } from 'date-fns';
import { Model } from 'mongoose';
import { IPAndURIDocument, IPAndURIModel, IPAndURISchema } from '../../securityDevices/model/IPAndURIModel';
import { JwtService } from '../../application/jwt-service';
import { SecurityDeviceServicePSQL } from '../../securityDevices/db-psql/securityDevice.service.PSQL';


@Injectable()
export class EmailOrLoginGuard implements CanActivate {
    constructor(protected usersServise: UsersService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const loginExists = await this.usersServise.findUserByLogin(req.body.login)
        const emailExists = await this.usersServise.findUserByEmail(req.body.email)
        
        if (loginExists !== null) {
            throw new BadRequestException([
                { message: 'BAD REQUEST', field: 'login' },
            ])
        }
        if (emailExists !== null) {
            throw new BadRequestException([
                { message: 'BAD REQUEST', field: 'email' },
            ])
        }
        return true
    }
}

@Injectable()
export class GetUserIdByAuth implements CanActivate {
    constructor(protected jwtService: JwtService
    ) { }
    async canActivate(context: ExecutionContext): Promise<any> {
        const req = context.switchToHttp().getRequest();
        if (!req.headers.authorization || req.headers.authorization === undefined) {
            req.userId = null
            return true
        }
        const token = req.headers.authorization.split(' ')[1]
        const userId: any = await this.jwtService.getPayloadByRefreshToken(token)

        req.userId = userId ? userId : null
        return true
    }
}

@Injectable()
export class UserAuthGuard implements CanActivate {
    constructor(protected jwtService: JwtService
    ) { }
    async canActivate(context: ExecutionContext): Promise<any> {
        const req = context.switchToHttp().getRequest();
        if (!req.headers.authorization || req.headers.authorization === undefined) {
            throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)
        }
        const token = req.headers.authorization.split(' ')[1]
        const userId: any = await this.jwtService.getPayloadByRefreshToken(token)
        if (!userId) {
            throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)
        }

        req.userId = userId ? userId : null
        return true
    }
}

@Injectable()
export class FilterCountIPAndURL implements CanActivate {
    constructor(@InjectModel(IPAndURIModel.name) private ipAndURIModel: Model<IPAndURIDocument>) { }


    async canActivate(context: ExecutionContext): Promise<any> {
        const req = context.switchToHttp().getRequest();
        const connectionDate = new Date()
        const IP = req.ip
        const URL = req.originalUrl //|| req.baseUrl 
        const newAPI = {
            IP,
            URL,
            date: connectionDate.toISOString()
        }
        const count = await this.ipAndURIModel.countDocuments({ IP: newAPI.IP, URL: newAPI.URL, date: { $gte: addSeconds(connectionDate, -10).toISOString() } })
        if (count + 1 > 5) {
           throw new HttpException('429', HttpStatus.FAILED_DEPENDENCY)
        }
        //await IPAndURIModelClass.insertOne({...newAPI})
        const IPAndURIInstance = new this.ipAndURIModel(newAPI)
        IPAndURIInstance.IP = IP
        IPAndURIInstance.URL = URL
        IPAndURIInstance.date = connectionDate.toISOString()
        await IPAndURIInstance.save()
        return true
    }
}

@Injectable()
export class ChekRefreshToken {
    constructor(protected jwtService: JwtService,
        protected securityDeviceService: SecurityDeviceServicePSQL
    ) { }
    async canActivate(context: ExecutionContext): Promise<any> {
        const req = context.switchToHttp().getRequest();
        const cookiesRefreshToken = req.cookies.refreshToken
        if (!cookiesRefreshToken) throw new HttpException('UNAUTHORIZED now token', HttpStatus.UNAUTHORIZED)

        const validationToken = await this.jwtService.checkingTokenKey(cookiesRefreshToken)
        if (validationToken === null) throw new HttpException('UNAUTHORIZED not valid', HttpStatus.UNAUTHORIZED)    
        
        const expiredToken = await this.securityDeviceService.findTokenAndDevice(cookiesRefreshToken)
        if (expiredToken.result === null) throw new HttpException(['UNAUTHORIZED expired', expiredToken], HttpStatus.UNAUTHORIZED)

        return true
    }
}



@Injectable()
export class ChekRefreshTokenDeleteDevice {
    constructor(protected jwtService: JwtService,
        protected securityDeviceService: SecurityDeviceServicePSQL
    ) { }
    async canActivate(context: ExecutionContext): Promise<any> {
        const req = context.switchToHttp().getRequest();
        const cookiesRefreshToken = req.cookies.refreshToken
        if (!cookiesRefreshToken) throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)
        const validationToken = await this.jwtService.checkingTokenKey(cookiesRefreshToken)
        if (validationToken === null) throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)    
       
        return true
    }
}


// @Injectable()
// export class emailRegistrationGuard implements CanActivate {
//     constructor(protected usersServise: UsersService) {}

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const req = context.switchToHttp().getRequest();
//         const emailExists = await this.usersServise.findUserByEmail(req.body.email)
//         if (emailExists === HttpStatus.NOT_FOUND) {
//             throw new BadRequestException([
//                 { message: 'BAD REQUEST', field: 'email' },
//             ])
//         }
//         return true
//     }
// }


// @Injectable()
// export class confirmationCodeExistsGuard implements CanActivate {
//     constructor(protected authService: AuthService) {}

//     async canActivate(context: ExecutionContext): Promise<boolean> {
//         const req = context.switchToHttp().getRequest();
//         const codeExists = await this.authService.confirmationCode(req.body.code)
//         if (codeExists === HttpStatus.BAD_REQUEST) {
//             throw new BadRequestException([
//                 { message: 'BAD REQUEST', field: 'code' },
//             ])
//         }
//         return true
//     }
// }
