import { InjectModel } from "@nestjs/mongoose";
import { devicesMongo } from "./model/device-model";
import { DevicesModel, DevicesModelDocument } from "./model/device-schema";
import mongoose, { Model, ObjectId } from "mongoose";
import { Injectable } from "@nestjs/common"

@Injectable()

export class SecurityDeviceRepository {
    constructor(@InjectModel(DevicesModel.name) private devicesMododel: Model<DevicesModelDocument>,

    ) { }
    
    async addRefreshToken(newDeviceAndRefreshToken: devicesMongo): Promise<boolean | null> {
        try {
            const res = await this.devicesMododel.insertMany({ ...newDeviceAndRefreshToken })
            return true
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

    async findTokenAndDeviceByissuedAt(issuedAt: string): Promise<true | null> {

        try {
            const res = await this.devicesMododel.findOne({ issuedAt: issuedAt })
            if (res === null) { return null }
            return true
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
            const res = await this.devicesMododel.deleteOne({ deviceId: deviceId });
            if (res === null) { return null }
            return res.acknowledged
        }
        catch (e) { return null }
    }

    async deleteAllDevicesExceptOne(deviceId: string, userId: string): Promise<Boolean | null> {
        //добавить фильтр по userId

        try {
            const checkUserIdByDeviceId = await this.devicesMododel.find({ userId: userId, deviceId: deviceId }).lean()
            if (checkUserIdByDeviceId.length === 0) { return null }
            const res = await this.devicesMododel.deleteMany({ deviceId: { $ne: deviceId } });
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