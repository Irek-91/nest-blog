import { Controller, Get, Query, HttpException, HttpStatus, Param, Post, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { log } from 'console';
import { AuthGuard } from 'src/auth.guard';
import mongoose, { ObjectId } from "mongoose";

import { UsersService } from 'src/users/users.service';
import { LoginInputModel } from './model/auth.model';
import { AuthService } from './auth.service';
import { JwtService } from 'src/application/jwt-service';
import { SecurityDeviceService } from 'src/securityDevices/securityDevice.service';


@Controller('auth')

export class AuthController {
    constructor(protected usersService: UsersService,
        protected jwtService: JwtService,
        protected securityDeviceService: SecurityDeviceService, 
        protected authService: AuthService) {}

    @Post('/login')
    async loginUserToTheSystem(@Body() loginInputData: LoginInputModel ) {
        const divicId = uuidv4();
        const IP = req.ip
        const title = req.headers['user-agent'] || 'custom-ua'
        const newUser = await this.usersService.checkCredentials(loginInputData.loginOrEmail, loginInputData.password);
        if (newUser === HttpStatus.NOT_FOUND) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        } 

        const accessToken = await this.jwtService.createdJWTAccessToken(newUser._id)
        const refreshToken = await this.securityDeviceService.addDeviceIdRefreshToken(newUser._id, divicId, IP, title)
        if (accessToken !== null || refreshToken !== null) {
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
            res.status(200).send({ accessToken })
        }
        else {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND)
        }
    }
    async generateNewPairOfAccessAndRefreshTokens(req: Request, res: Response) {
        const cookiesRefreshToken = req.cookies.refreshToken
        const IP = req.ip
        const title = req.headers['user-agent'] || 'custom-ua'

        const newAccessToken = await this.securityDeviceService.updateAccessToken(cookiesRefreshToken)
        const newRefreshToken = await this.securityDeviceService.updateDevicesModelClass(cookiesRefreshToken, IP, title)

        if (newAccessToken !== null || newRefreshToken !== null) {
            res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true })
            res.status(200).send({ accessToken: newAccessToken })
        }
        else {
            res.sendStatus(401)
        }
    }

    async sendCorrectRefreshTokenThatWillBeRevoked(req: Request, res: Response) {
        const cookiesRefreshToken = req.cookies.refreshToken
        const result = await this.securityDeviceService.deleteDeviceIdRefreshToken(cookiesRefreshToken)
        if (result === true) {
            res.clearCookie('refreshToken')
            res.sendStatus(204)
        }
        else {
            res.sendStatus(401)
        }
    }
    async getInformationAboutCurrentUser(req: Request, res: Response) {
        if (req.user !== false) {
            const user = await this.usersService.findByUserId(req.user._id)
            if (user !== false) {
                res.status(200).send(user)
            }
            else {
                res.sendStatus(401)
            }
        } else {
            res.sendStatus(401)
        }
    }
    async codeWillBeSendToPassedEmailAddress(req: Request, res: Response) {
        const user = await this.authService.creatUser(req.body.login, req.body.password, req.body.email)
        if (user) {
            res.sendStatus(204)
        }
        else {
            res.status(400).send({
                errorsMessages: [
                    {
                        message: "if email is already confirmed",
                        field: "email"
                    }
                ]
            })
        }
    }

    async confirmRegistrationCode(req: Request, res: Response) {
        const result = await this.authService.confirmationCode(req.body.code)
        if (result) {
            res.sendStatus(204)
        }
        else {
            res.status(400).send({
                errorsMessages: [
                    {
                        message: "Error in code",
                        field: "code"
                    }
                ]
            })
        }
    }

    async resendConfirmationRegistrationEmail(req: Request, res: Response) {
        const result = await this.authService.resendingEmail(req.body.email)
        if (result) { res.sendStatus(204) }
        else {
            res.status(400).send({
                errorsMessages: [
                    {
                        message: "if email is already confirmed",
                        field: "email"
                    }
                ]
            })
        }
    }

    async passwordRecoveryViaEmail(req: Request, res: Response) {
        const result = await this.authService.passwordRecovery(req.body.email)
        res.sendStatus(204)
    }

    async confirmNewPasswordRecovery(req: Request, res: Response) {
        const newPassword = req.body.newPassword
        const recoveryCode = req.body.recoveryCode
        const result = await this.authService.newPassword(newPassword, recoveryCode)
        if (result) {
            res.sendStatus(204)
        }
        else {
            res.status(400).send({
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

