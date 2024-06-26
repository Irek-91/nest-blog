import { JwtService } from '../../infrastructure/adapters/jwt-service';
import { DeviceViewModel, devicesMongo } from '../model/device-model';
import mongoose from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SecurityDeviceRepoPSQL } from './securityDevice.repo.PSQL';

@Injectable()
export class SecurityDeviceServicePSQL {
  constructor(
    protected securityDeviceRepository: SecurityDeviceRepoPSQL,
    protected jwtService: JwtService,
  ) {}

  async getDeviceByToken(
    token: string,
    IP: string,
  ): Promise<DeviceViewModel[] | null> {
    const userId = await this.jwtService.getUserIdByRefreshToken(token);
    const results =
      await this.securityDeviceRepository.getTokenAndDevice(userId);
    if (results === null) {
      return null;
    }

    const resultDeviceIdOutput = results.map((b) => {
      return {
        ip: b.IP,
        title: b.deviceName,
        lastActiveDate: b.issuedAt,
        deviceId: b.deviceId,
      };
    });

    return resultDeviceIdOutput;
  }

  async deleteDeviceId(deviceId: string): Promise<boolean | null> {
    const result = await this.securityDeviceRepository.deleteDeviceId(deviceId);
    return result;
  }

  async deleteDeviceByUserId(
    refreshToken: string,
    deviceId: string,
  ): Promise<null | true> {
    const resultDeviceId =
      await this.securityDeviceRepository.findOneDeviceId(deviceId);

    if (!resultDeviceId) {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }

    const resultUserId = await this.jwtService.getUserIdByToken(refreshToken);
    if (resultDeviceId.userId !== resultUserId) {
      throw new HttpException(
        'If try edit the comment that is not your own',
        HttpStatus.FORBIDDEN,
      );
    }

    const result = await this.securityDeviceRepository.deleteDeviceId(deviceId);
    return result;
  }

  async deleteAllDevicesByUserId(userId: string): Promise<null | true> {
    const result =
      await this.securityDeviceRepository.deleteAllDevicesByUserId(userId);
    return result;
  }

  async deleteAllDevicesExceptOne(
    refreshToken: string,
  ): Promise<boolean | null> {
    const deviceId =
      await this.jwtService.getDeviceIdByRefreshToken(refreshToken);
    const userId = await this.jwtService.getUserIdByRefreshToken(refreshToken);

    const res = await this.securityDeviceRepository.deleteAllDevicesExceptOne(
      deviceId,
      userId,
    );
    return res;
  }

  async findTokenAndDevice(
    token: string,
  ): Promise<{ result: any; device?: any; issuedAt?: string }> {
    const deviceId = await this.jwtService.getDeviceIdByRefreshToken(token);
    const userId = await this.jwtService.getUserIdByRefreshToken(token);
    const issuedAt = await this.jwtService.getIssueAttByRefreshToken(token);
    const device = await this.securityDeviceRepository.findDeviceByIdAndUserId(
      userId,
      deviceId,
    );
    if (device === null) {
      return { result: null };
    }
    if (device.issuedAt !== issuedAt) {
      return { result: null, device, issuedAt };
    } else {
      return { result: true };
    }
  }

  async addDeviceIdRefreshToken(
    userId: string,
    deviceId: string,
    IP: string,
    deviceName: string,
  ): Promise<null | string> {
    const refreshToken = await this.jwtService.createdJWTRefreshToken(
      userId,
      deviceId,
    );
    const issuedAt =
      await this.jwtService.getIssueAttByRefreshToken(refreshToken);
    const expirationDate =
      await this.jwtService.getExpiresAttByRefreshToken(refreshToken);
    const newDeviceAndRefreshToken: devicesMongo = {
      _id: new mongoose.Types.ObjectId(),
      issuedAt,
      expirationDate,
      deviceId,
      IP,
      deviceName,
      userId,
    };

    const addTokenUser = await this.securityDeviceRepository.addRefreshToken(
      newDeviceAndRefreshToken,
    );
    if (addTokenUser !== true) {
      return null;
    }
    return refreshToken;
  }

  async updateAccessToken(refreshToken: string): Promise<string | null> {
    const userId = await this.jwtService.getUserIdByRefreshToken(refreshToken);
    if (userId === null) {
      return null;
    }
    const newAccessToken = await this.jwtService.createdJWTAccessToken(userId);
    return newAccessToken;
  }

  async updateDevicesModelClass(
    refreshToken: string,
    IP: string,
    deviceName: string,
  ): Promise<string | null> {
    const userId = await this.jwtService.getUserIdByRefreshToken(refreshToken);
    if (userId === null) {
      return null;
    }
    const deviceId =
      await this.jwtService.getDeviceIdByRefreshToken(refreshToken);
    if (deviceId === null) {
      return null;
    }

    // const issuedAt = await  this.jwtService.getIssuedAttByRefreshToken(refreshToken)
    // if (issuedAt === null) { return null }

    // const device = await this.securityDeviceRepository.findDeviceByIdAndUserId(userId, deviceId)
    // if (device === null) { return null }
    // if (device.issuedAt !== issuedAt) { return null }

    const result = await this.securityDeviceRepository.updateRefreshToken(
      userId,
      deviceId,
      IP,
      deviceName,
    );

    if (result) {
      return result;
    } else {
      return null;
    }
  }

  async deleteDeviceIdRefreshToken(refreshToken: string): Promise<true | null> {
    const userId = await this.jwtService.getUserIdByRefreshToken(refreshToken);
    const deviceId =
      await this.jwtService.getDeviceIdByRefreshToken(refreshToken);

    const issuedAt =
      await this.jwtService.getIssuedAttByRefreshToken(refreshToken);
    if (issuedAt === null) {
      return null;
    }

    // const device = await this.securityDeviceRepository.findDeviceByIdAndUserId(userId, deviceId)
    // if (device === null) { return null }
    // if (device.issuedAt !== issuedAt) { return null }

    const resultDelete =
      await this.securityDeviceRepository.deleteTokenAndDevice(
        userId,
        deviceId,
      );
    if (resultDelete === null) {
      return null;
    }
    return true;
  }
  async deleteDevices() {
    return await this.securityDeviceRepository.deleteDevicesAll();
  }
}
