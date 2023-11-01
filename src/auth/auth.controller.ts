import { UsersService } from './../users/users.service';
import { SecurityDeviceService } from './../securityDevices/securityDevice.service';
import { JwtService } from './../application/jwt-service';
import { Controller, Get, Query, Param, HttpException, HttpStatus, Post, Body, Request, Put, Delete, UseGuards, Response, BadRequestException, HttpCode } from '@nestjs/common';
import { log } from 'console';
import { AuthGuard } from '@nestjs/passport';

import { LoginInputModel, NewPasswordRecoveryInputModel, RegistrationConfirmationCodeModel, RegistrationEmailResending, RegistrationUserInputModel } from './model/auth.model';
import { AuthService } from './auth.service';
import { v4 as uuidv4 } from 'uuid';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/local-jwt.guard';
import { EmailOrLoginGuard } from './guards/auth.guard';

@Controller('auth')


export class AuthController {
    constructor(protected usersService: UsersService,
        protected jwtService: JwtService,
        protected securityDeviceService: SecurityDeviceService,
        protected authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('/login')
    async loginUserToTheSystem(@Request() req: any,
        @Body() loginInputData: LoginInputModel,
        @Response() res: any) {
        const divicId = uuidv4();
        const IP = req.ip
        const title = req.headers['user-agent'] || 'custom-ua'
        // const user = await this.usersService.checkCredentials(loginInputData.loginOrEmail, loginInputData.password);
        // if (user === HttpStatus.NOT_FOUND) {
        //     throw new HttpException('Not Found', HttpStatus.UNAUTHORIZED);
        // }
        const accessToken = await this.jwtService.createdJWTAccessToken(req.user._id)
        const refreshToken = await this.securityDeviceService.addDeviceIdRefreshToken(req.user._id, divicId, IP, title)
        if (accessToken !== null || refreshToken !== null) {
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
            //res.status(200).send({ accessToken })
            return res.status(200).send({ accessToken })
        }
        else {
            throw new HttpException('Not Found', HttpStatus.UNAUTHORIZED);
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
    @UseGuards(JwtAuthGuard)
    @Get('/me')
    async getInformationAboutCurrentUser(@Request() req: any) {
        const user = await this.usersService.findByUserId(req.userId)
        return user
    }

    @UseGuards(EmailOrLoginGuard)
    @Post('/registration')
    async codeWillBeSendToPassedEmailAddress(@Body() inputData: RegistrationUserInputModel) {

        const user = await this.authService.creatUser(inputData.login, inputData.password, inputData.email)
        throw new HttpException('No content', HttpStatus.NO_CONTENT)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('/registration-confirmation')
    async confirmRegistrationCode(@Body() inputData: RegistrationConfirmationCodeModel) {
        return this.authService.confirmationCode(inputData.code)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('/registration-email-resending')
    async resendConfirmationRegistrationEmail(@Body() inputData: RegistrationEmailResending) {
        return this.authService.resendingEmail(inputData.email)
    }

    @Post('/password-recovery')
    async passwordRecoveryViaEmail(@Body() inputData: RegistrationEmailResending) {
        const result = await this.authService.passwordRecovery(inputData.email)
        if (result === HttpStatus.NO_CONTENT) {
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
            throw new BadRequestException({
                errorsMessages: [
                    {
                        message: "RecoveryCode is incorrect or expired",
                        field: "recoveryCode"
                    }
                ]
            })
        }

    }
}
