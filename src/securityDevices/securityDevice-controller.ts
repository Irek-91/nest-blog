import { Controller, Get, Query, HttpException, HttpStatus, Param, Post, Body, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { SecurityDeviceService } from './securityDevice.service';
import { ChekRefreshToken } from './../auth/guards/auth.guard';

@Controller('security')

export class SecurityDeviceController {
    constructor(protected securityDeviceService: SecurityDeviceService) {}
    
    
    @UseGuards(ChekRefreshToken)
    @Get('/devices')
    async getDeviceByToken(
        @Request() req: any) {
        const refreshToken = req.cookies.refreshToken
        const IP = req.ip
        const resultGetDevice = await this.securityDeviceService.getDeviceByToken(refreshToken, IP)

        if (resultGetDevice) {
            return resultGetDevice
        }
        else {
            throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)
        }
    }
    
    @UseGuards(ChekRefreshToken)
    @Delete('devices')
    async deleteAllDevicesExceptOne(
        @Request() req: any) {
        const refreshToken = req.cookies.refreshToken
        const resultDelete = await this.securityDeviceService.deleteAllDevicesExceptOne(refreshToken)
        if (!resultDelete) {
            throw new HttpException('No Content', HttpStatus.NO_CONTENT)
        }
        else {
            throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED)
        }
    }

    @Delete('/devices/:deviceId')
    async deleteDeviceByUserId(
        @Request() req: any) {
        const refreshToken = req.cookies.refreshToken
        const deviceId = req.params.deviceId
        const result = await this.securityDeviceService.deleteDeviceByUserId(refreshToken, deviceId)
    }
}
