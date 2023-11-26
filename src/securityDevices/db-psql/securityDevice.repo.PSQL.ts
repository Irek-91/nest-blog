import { InjectModel } from "@nestjs/mongoose";
import { devicesMongo, devicesPSQL } from "../model/device-model";
import { DevicesModel, DevicesModelDocument } from "../model/device-schema";
import mongoose, { Model, ObjectId } from "mongoose";
import { Injectable } from "@nestjs/common"
import { JwtService } from "../../application/jwt-service";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { log } from "console";

@Injectable()

export class SecurityDeviceRepoPSQL {
    constructor(@InjectDataSource() private devicesMododel: DataSource,
    protected jwtService: JwtService

    ) { }

    async addRefreshToken(newDevice: devicesMongo): Promise<boolean | null> {
        try {
            const query = `INSERT INTO public."Devices"(
                "deviceId", "issuedAt", "expirationDate", "IP", "deviceName", "userId")
                VALUES ('${newDevice.deviceId}', '${newDevice.issuedAt}',
                        '${newDevice.expirationDate}', '${newDevice.IP}',
                        '${newDevice.deviceName}', '${newDevice.userId}');
            `
            const res = await this.devicesMododel.query(query)
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
          
            const query =`UPDATE public."Devices"
                            SET "issuedAt" = '${issuedAt}',
                                "expirationDate" = '${expirationDate}', "IP" = '${device!.IP}'
                            WHERE "userId" = $1`
            
            const res = await this.devicesMododel.query(query, [device!.userId])
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

    async findDeviceByIdAndUserId(userId: string, deviceId: string): Promise<devicesPSQL | null> {

        try {
            const res = await this.devicesMododel.query(`
            SELECT * FROM public."Devices" as d
            WHERE d."userId" = $1 AND d."deviceId" = $2
            `, [userId, deviceId])
            if (res.length === 0) { return null }
            //const devicesOutput: devicesPSQL = res.map((b) => {
                return {
                    issuedAt: res[0].issuedAt,
                    expirationDate: res[0].expirationDate,
                    deviceId: res[0].deviceName,
                    IP: res[0].IP,
                    deviceName: res[0].deviceName,
                    userId: res[0].userId 
                }
              //})
              //return devicesOutput        
            }
        catch (e) { return null }
    }

    async deleteTokenAndDevice(userId: string, deviceId: string): Promise<true | null> {
        try {
            const res = await this.devicesMododel.query(`
            DELETE FROM public."Devices" as d
            WHERE d."userId" = $1 AND d."deviceId" = $2
            `, [userId, deviceId])
            if (res.length === 0) { return null }
            return true
        }
        catch (e) { return null }
    }

    async deleteDevicesAll() {
        const deletResult = await this.devicesMododel.query(`
        DELETE FROM public."Devices"
        `)
        return true
    }

    async getTokenAndDevice(userId: string): Promise<devicesPSQL[] | null> {

        try {
            const res = await this.devicesMododel.query(`
            SELECT *FROM public."Devices" as u
            WHERE u."userId" = $1
            `, [userId])
            //find({ userId: userId }).lean();
            if (res.length === 0) { return null }
            const devicesOutput: devicesPSQL[] = res.map((b) => {
                return {
                    issuedAt: b.issuedAt,
                    expirationDate: b.expirationDate,
                    deviceId: b.deviceId,
                    IP: b.IP,
                    deviceName: b.deviceName,
                    userId: b.userId 
                }
              })
              return devicesOutput
            
        }
        catch (e) { return null }
    }

    async deleteDeviceId(deviceId: string): Promise<null | true> {
        try {
            const res = await this.devicesMododel.query(`
            DELETE FROM public."Devices" as u
            WHERE u."deviceId" = $1
            `, [deviceId])
            if (res.length === 0) { return null }
            return true
        }
        catch (e) { return null }
    }

    async deleteAllDevicesExceptOne(deviceId: string, userId: string): Promise<Boolean | null> {
        //добавить фильтр по userId

        try {
            const checkUserIdByDeviceId = await this.devicesMododel.query(`
            SELECT * FROM public."Devices" as u 
            WHERE u."deviceId" = $1 AND u."userId" = $2
            `, [deviceId, userId]
            )
            if (checkUserIdByDeviceId.length === 0) { return null }
            const res = await this.devicesMododel.query(`
            DELETE FROM public."Devices" as d
            WHERE d."userId" = $1 AND d."deviceId" != $2
            `, [userId, deviceId])

            //deleteMany({ userId: userId, deviceId: { $ne: deviceId } });
            if (res.length === 0) { return null }
            return true
        }
        catch (e) { return null }
    }

    async findOneDeviceId(deviceId: string): Promise<devicesPSQL | null> {
        try {
            const device = await this.devicesMododel.query(
                `SELECT * FROM public."Devices" as u WHERE u."deviceId" = $1`, [deviceId]
            );
            if (device.length === 0) { return null }
            //const deviceIdOutput : devicesPSQL = device.map((b) => {
                return {
                    issuedAt: device[0].issuedAt,
                    expirationDate: device[0].expirationDate,
                    deviceId: device[0].deviceName,
                    IP: device[0].IP,
                    deviceName: device[0].deviceName,
                    userId: device[0].userId
                }
            //   })
            // return deviceIdOutput
        }
        catch (e) { return null }
    }

}