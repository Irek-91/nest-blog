import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  Response,
} from '@nestjs/common';
import { SecurityDeviceServicePSQL } from './db-psql/securityDevice.service.PSQL';
import { CheckRefreshToken } from './../auth/guards/auth.guard';
import { Cookies } from './../auth/guards/cookies.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('security')
@ApiTags('security')
export class SecurityDeviceController {
  constructor(protected securityDeviceService: SecurityDeviceServicePSQL) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(CheckRefreshToken)
  @Get('/devices')
  async getDeviceByToken(
    @Request() req: any,
    @Cookies('refreshToken') refreshToken: string,
  ) {
    const IP = req.ip;
    const resultGetDevice = await this.securityDeviceService.getDeviceByToken(
      refreshToken,
      IP,
    );
    return resultGetDevice;
  }

  @UseGuards(CheckRefreshToken)
  @Delete('/devices')
  async deleteAllDevicesExceptOne(
    @Cookies('refreshToken') refreshToken: string,
  ) {
    const resultDelete =
      await this.securityDeviceService.deleteAllDevicesExceptOne(refreshToken);
    if (!resultDelete) {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    } else {
      throw new HttpException('No Content', HttpStatus.NO_CONTENT);
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CheckRefreshToken)
  @Delete('/devices/:deviceId')
  async deleteDeviceByUserId(
    @Response({ passthrough: true }) res: any,
    @Param('deviceId') deviceId: string,
    @Request() req: any,
    @Cookies('refreshToken') refreshToken: string,
  ) {
    const result = await this.securityDeviceService.deleteDeviceByUserId(
      refreshToken,
      deviceId,
    );
    res.clearCookie('refreshToken');
  }
}
