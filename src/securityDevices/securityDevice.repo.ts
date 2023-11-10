import { InjectModel } from "@nestjs/mongoose";
import { devicesMongo } from "./model/device-model";
import { DevicesModel, DevicesModelDocument } from "./model/device-schema";
import mongoose, { Model, ObjectId } from "mongoose";
import { Injectable } from "@nestjs/common"
import { JwtService } from "./../application/jwt-service";

@Injectable()

export class SecurityDeviceRepository {
    constructor(@InjectModel(DevicesModel.name) private devicesMododel: Model<DevicesModelDocument>,
    protected jwtService: JwtService

    ) { }

    async addRefreshToken(newDeviceAndRefreshToken: devicesMongo): Promise<boolean | null> {
        try {
            const res = await this.devicesMododel.insertMany({ ...newDeviceAndRefreshToken })
            return true
        }
        catch (e) { return null }
    }

    async updateRefreshToken(userId: string, deviceId: string, IP: string, deviceName: string): Promise<string | null> {
        try {
            const device = await this.findDeviceByIdAndUserId(userId, deviceId)
            const refreshToken = await this.jwtService.createdJWTRefreshToken(userId, deviceId)
            const issuedAt = await this.jwtService.getIssueAttByRefreshToken(refreshToken)
            const expirationDate = await this.jwtService.getExpiresAttByRefreshToken(refreshToken)
            device!.userId = userId
            device!.deviceId = deviceId
            device!.issuedAt = issuedAt
            device!.expirationDate = expirationDate
            device!.IP = IP
            device!.deviceName = deviceName
            device!.save()
            return refreshToken
        }
        catch (e) { return null }
    }

    // async getUserIdByDeviceId(deviceId: string): Promise<ObjectId | null> {

    //     try {
    //         const res = await this.devicesMododel.findOne({ deviceId: deviceId }).lean();
    //         if (res === null) { return null }
    //         return res.userId
    //     }
    //     catch (e) { return null }
    // }

    async findDeviceByIdAndUserId(userId: string, deviceId: string): Promise<DevicesModelDocument | null> {

        try {
            const res = await this.devicesMododel.findOne({ userId: userId, deviceId: deviceId })
            if (res === null) { return null }
            return res
        }
        catch (e) { return null }
    }

    async deleteTokenAndDevice(issuedAt: string): Promise<true | null> {
        try {
            const res = await this.devicesMododel.deleteOne({ issuedAt: issuedAt })
            if (res === null) { return null }
            return true
        }
        catch (e) { return null }
    }

    async deleteTokensAll() {
        const deletResult = await this.devicesMododel.deleteMany({})
        return true
    }

    async getTokenAndDevice(userId: string): Promise<DevicesModelDocument[] | null> {

        try {
            const res = await this.devicesMododel.find({ userId: userId }).lean();
            if (res === null) { return null }
            return res
        }
        catch (e) { return null }
    }

    async deleteDeviceId(deviceId: string): Promise<null | boolean> {
        try {
            const res = (await this.devicesMododel.deleteOne({ deviceId: deviceId }));
            if (res.acknowledged === true) { return null }
            return res.acknowledged
        }
        catch (e) { return null }
    }

    async deleteAllDevicesExceptOne(deviceId: string, userId: string): Promise<Boolean | null> {
        //добавить фильтр по userId

        try {
            const checkUserIdByDeviceId = await this.devicesMododel.find({ userId: userId, deviceId: deviceId }).countDocuments()
            if (checkUserIdByDeviceId === 0) { return null }
            const res = await this.devicesMododel.deleteMany({ userId: userId, deviceId: { $ne: deviceId } });
            if (res.deletedCount === 0) { return null }
            return res.acknowledged
        }
        catch (e) { return null }
    }

    async findOneDeviceId(deviceId: string): Promise<DevicesModelDocument | null> {
        try {
            const res = await this.devicesMododel.findOne({ deviceId: deviceId });
            if (res === null) { return null }
            return res
        }
        catch (e) { return null }
    }

}