import { Controller, Get, Query, HttpException, HttpStatus, Param, Post, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { log } from 'console';
import { AuthGuard } from 'src/auth.guard';
import mongoose, { ObjectId } from "mongoose";

import { UsersService } from 'src/users/users.service';
import { LoginInputModel, NewPasswordRecoveryInputModel, RegistrationConfirmationCodeModel, RegistrationEmailResending } from './model/auth.model';
import { AuthService } from './auth.service';
import { JwtService } from 'src/application/jwt-service';
import { SecurityDeviceService } from 'src/securityDevices/securityDevice.service';
import { v4 as uuidv4 } from 'uuid';


@Controller('auth')

export class AuthController {
    constructor(protected usersService: UsersService,
        protected jwtService: JwtService,
        protected securityDeviceService: SecurityDeviceService,
        protected authService: AuthService) { }

    @Post('/login')
    async loginUserToTheSystem(@Body() loginInputData: LoginInputModel) {
        const divicId = uuidv4();
        const IP = 'dsvs'//req.ip
        const title = 'user-agent'//req.headers['user-agent'] || 'custom-ua'
        const newUser = await this.usersService.checkCredentials(loginInputData.loginOrEmail, loginInputData.password);
        if (newUser === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
        const accessToken = await this.jwtService.createdJWTAccessToken(newUser._id)
        const refreshToken = await this.securityDeviceService.addDeviceIdRefreshToken(newUser._id, divicId, IP, title)
        if (accessToken !== null || refreshToken !== null) {
            //res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
            //res.status(200).send({ accessToken })
            return { accessToken }
        }
        else {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
    }

    @Post('/refresh-token')
    async generateNewPairOfAccessAndRefreshTokens() {
        const cookiesRefreshToken = ''//req.cookies.refreshToken
        const IP = ''//req.ip
        const title = ''//req.headers['user-agent'] || 'custom-ua'

        const newAccessToken = await this.securityDeviceService.updateAccessToken(cookiesRefreshToken)
        const newRefreshToken = await this.securityDeviceService.updateDevicesModelClass(cookiesRefreshToken, IP, title)

        if (newAccessToken !== null || newRefreshToken !== null) {
            //res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true })
            //res.status(200).send({ accessToken: newAccessToken })
            return { newAccessToken }
        }
        else {
            throw new HttpException('Not Found', HttpStatus.UNAUTHORIZED)
        }
    }

    @Post('/logout')
    async sendCorrectRefreshTokenThatWillBeRevoked() {
        const cookiesRefreshToken = ''//req.cookies.refreshToken
        const result = await this.securityDeviceService.deleteDeviceIdRefreshToken(cookiesRefreshToken)
        if (result === true) {
            //res.clearCookie('refreshToken')
            //res.sendStatus(204)
            throw new HttpException('No content', HttpStatus.NO_CONTENT)
        }
        else {
            throw new HttpException('Not Found', HttpStatus.UNAUTHORIZED)
        }
    }

    @Get('/me')
    async getInformationAboutCurrentUser(req: any) {
        if (req !== false) {
            const user = await this.usersService.findByUserId(req.user._id)
            if (user !== HttpStatus.NOT_FOUND) {
                //res.status(200).send(user)
                return user
            }
            else {
                throw new HttpException('Not Found', HttpStatus.UNAUTHORIZED)
            }
        } else {
            throw new HttpException('Not Found', HttpStatus.UNAUTHORIZED)
        }
    }


    // async codeWillBeSendToPassedEmailAddress(req: Request, res: Response) {
    //     const user = await this.authService.creatUser(req.body.login, req.body.password, req.body.email)
    //     if (user) {
    //         res.sendStatus(204)
    //     }
    //     else {
    //         res.status(400).send({
    //             errorsMessages: [
    //                 {
    //                     message: "if email is already confirmed",
    //                     field: "email"
    //                 }
    //             ]
    //         })
    //     }
    // }
    @Post('/registration-confirmation')
    async confirmRegistrationCode(@Body() inputData: RegistrationConfirmationCodeModel) {
        const result = await this.authService.confirmationCode(inputData.code)
        if (result ===  HttpStatus.NO_CONTENT) {
            //res.sendStatus(204)
            throw new HttpException('No content', HttpStatus.NO_CONTENT)
        }
        else {
            throw new HttpException({
                errorsMessages: [
                    {
                        message: "Error in code",
                        field: "code"
                    }
                ]
            }, HttpStatus.BAD_REQUEST)
        }
    }

    @Post('/registration-email-resending')
    async resendConfirmationRegistrationEmail(@Body() inputData : RegistrationEmailResending) {
        const result = await this.authService.resendingEmail(inputData.email)
        if (result === HttpStatus.NO_CONTENT) { 
            //res.sendStatus(204)
            throw new HttpException('No content', HttpStatus.NO_CONTENT)
        }
        else {
            throw new HttpException({
                errorsMessages: [
                    {
                        message: "if email is already confirmed",
                        field: "email"
                    }
                ]
            }, HttpStatus.BAD_REQUEST)
        }
    }
    @Post('/password-recovery')
    async passwordRecoveryViaEmail(@Body() inputData : RegistrationEmailResending) {
        const result = await this.authService.passwordRecovery(inputData.email)
        if (result ===  HttpStatus.NO_CONTENT ) {
            throw new HttpException('No content', HttpStatus.NO_CONTENT)
        } else {
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST)
        }
    }
    @Post('/new-password')
    async confirmNewPasswordRecovery(@Body() inputData: NewPasswordRecoveryInputModel) {
        const newPassword = inputData.newPassword
        const recoveryCode = inputData.recoveryCode
        const result = await this.authService.newPassword(newPassword, recoveryCode)
        if (result === HttpStatus.NO_CONTENT) {
            //res.sendStatus(204)
            throw new HttpException('No content', HttpStatus.NO_CONTENT)
        }
        else {
            throw new HttpException({
                errorsMessages: [
                    {
                        message: "RecoveryCode is incorrect or expired",
                        field: "recoveryCode"
                    }
                ]
            }, HttpStatus.BAD_REQUEST)
        }

    }

}

