import { Controller, Get, Query, HttpException, HttpStatus, Param, Post, Body, Put, Delete, UseGuards, Request, HttpCode, Response } from '@nestjs/common';
import {  SecurityDeviceServicePSQL } from './db-psql/securityDevice.service.PSQL';
import { ChekRefreshToken, ChekRefreshTokenDeleteDevice } from './../auth/guards/auth.guard';
import { Cookies } from './../auth/guards/cookies.guard';

@Controller('security')

export class SecurityDeviceController {
    constructor(protected securityDeviceService: SecurityDeviceServicePSQL) { }

    @HttpCode(HttpStatus.OK)
    @UseGuards(ChekRefreshToken)
    @Get('/devices')
    async getDeviceByToken(
        @Request() req: any,
        @Cookies('refreshToken') refreshToken: string) {
        const IP = req.ip
        const resultGetDevice = await this.securityDeviceService.getDeviceByToken(refreshToken, IP)

        // if (resultGetDevice) {
        return resultGetDevice
        // }
        // else {
        //     throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)
        // }
    }

    @UseGuards(ChekRefreshToken)
    @Delete('/devices')
    async deleteAllDevicesExceptOne(
        @Cookies('refreshToken') refreshToken: string) {
        const resultDelete = await this.securityDeviceService.deleteAllDevicesExceptOne(refreshToken)
        if (!resultDelete) {
            throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)

        }
        else {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(ChekRefreshToken)
    @Delete('/devices/:deviceId')
    async deleteDeviceByUserId(
        @Response({ passthrough: true }) res: any,
        @Param('deviceId') deviceId: string,
        @Request() req: any,
        @Cookies('refreshToken') refreshToken: string) {
            
        const result = await this.securityDeviceService.deleteDeviceByUserId(refreshToken, deviceId)
        res.clearCookie('refreshToken')
    }
}
