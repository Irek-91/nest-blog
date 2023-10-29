import { JwtService } from './../application/jwt-service';
import { DeviceViewModel, devicesMongo } from "./model/device-model"
import { SecurityDeviceRepository } from "./securityDevice.repo"
import mongoose, { ObjectId } from "mongoose"
import { log } from "console"
import { Injectable } from "@nestjs/common"

@Injectable()
export class SecurityDeviceService {
    constructor(protected securityDeviceRepository: SecurityDeviceRepository,
        protected jwtService: JwtService) {}

    async getDeviceByToken(token: string, IP: string): Promise<DeviceViewModel[] | null> {
        const userId = await this.jwtService.getUserIdByRefreshToken(token)
        const results = await this.securityDeviceRepository.getTokenAndDevice(userId)
        if (results === null) { return null }

        const resultDeviceIdOutput = results.map((b) => {
            return {
                ip: b.IP,
                title: b.deviceName,
                lastActiveDate: b.issuedAt,
                deviceId: b.deviceId
            }
        })

        return resultDeviceIdOutput

    }

    async deleteDeviceId(deviceId: string): Promise<boolean | null> {
        const result = await this.securityDeviceRepository.deleteDeviceId(deviceId)
        return result
    }

    async deleteDeviceByUserId(refreshToken: string, deviceId: string): Promise<number> {

        const resultDeviceId = await this.securityDeviceRepository.findOneDeviceId(deviceId)
        if (!resultDeviceId) { return 404 }
        const resultUserId = await this.jwtService.getUserIdByToken(refreshToken)
        if (resultDeviceId.userId.toString() !== resultUserId!.toString()) { return 403 }
        else {
            const result = await this.securityDeviceRepository.deleteDeviceId(deviceId)
            return 204
        }
    }

    async deleteAllDevicesExceptOne(refreshToken: string): Promise<Boolean | null> {
        const deviceId = await this.jwtService.getDeviceIdByRefreshToken(refreshToken)
        const userId = await this.jwtService.getUserIdByRefreshToken(refreshToken)

        const res = await this.securityDeviceRepository.deleteAllDevicesExceptOne(deviceId, userId)
        return res
    }

    async findTokenAndDevice(token: string): Promise<boolean | null> {
        const issuedAt = await this.jwtService.getIssueAttByRefreshToken(token)
        const resultIssuedAt = await this.securityDeviceRepository.findTokenAndDeviceByissuedAt(issuedAt)
        if (resultIssuedAt) { return true }
        else { return null }
    }

    async addDeviceIdRefreshToken(userId: mongoose.Types.ObjectId, deviceId: string, IP: string, deviceName: string): Promise<null | string> {
        const refreshToken = await this.jwtService.createdJWTRefreshToken(userId, deviceId)
        const issuedAt = await  this.jwtService.getIssueAttByRefreshToken(refreshToken)
        const expirationDate = await  this.jwtService.getExpiresAttByRefreshToken(refreshToken)
        const newDeviceAndRefreshToken: devicesMongo = {_id: new mongoose.Types.ObjectId(),
            issuedAt,
            expirationDate,
            deviceId,
            IP,
            deviceName,
            userId}
            
        const addTokenUser = await this.securityDeviceRepository.addRefreshToken(newDeviceAndRefreshToken)
        if (addTokenUser !== true) { return null }
        return refreshToken
    }

    async updateAccessToken(refreshToken: string): Promise<string | null> {
        const userId = await  this.jwtService.getUserIdByRefreshToken(refreshToken)
        if (userId === null) { return null }
        const newAccessToken = await  this.jwtService.createdJWTAccessToken(userId)
        return newAccessToken
    }

    async updateDevicesModelClass(refreshToken: string, IP: string, deviceName: string): Promise<string | null> {
        const userId = await  this.jwtService.getUserIdByRefreshToken(refreshToken)
        if (userId === null) { return null }
        const deviceId = await  this.jwtService.getDeviceIdByRefreshToken(refreshToken)
        if (deviceId === null) { return null }

        const issuedAt = await  this.jwtService.getIssuedAttByRefreshToken(refreshToken)
        if (issuedAt === null) { return null }

        const resultDelete = await this.securityDeviceRepository.deleteTokenAndDevice(issuedAt)
        if (resultDelete === null) { return null }

        const result = await this.addDeviceIdRefreshToken(userId, deviceId, IP, deviceName)

        if (result) {
            return result
        }
        else { return null }
    }


    async deleteDeviceIdRefreshToken(refreshToken: string): Promise<true | null> {
        const issuedAt = await  this.jwtService.getIssuedAttByRefreshToken(refreshToken)
        if (issuedAt === null) { return null }

        const resultDelete = await this.securityDeviceRepository.deleteTokenAndDevice(issuedAt)
        if (resultDelete === null) { return null }
        return true
    }
}

