import { User } from './../../users/db-psql/entity/user.entity';
import { Device } from './entity/devices.entity';
import { InjectModel } from "@nestjs/mongoose";
import { devicesMongo, devicesPSQL } from "../model/device-model";
import { DevicesModel, DevicesModelDocument } from "../model/device-schema";
import mongoose, { Model, ObjectId } from "mongoose";
import { Injectable } from "@nestjs/common"
import { JwtService } from "../../adapters/jwt-service";
import { InjectDataSource, InjectEntityManager } from "@nestjs/typeorm";
import { DataSource, EntityManager, Not } from "typeorm";
import { log } from "console";

@Injectable()

export class SecurityDeviceRepoPSQL {
    constructor(@InjectDataSource() private devicesMododel: DataSource,
        @InjectEntityManager() private entityManager: EntityManager,
        protected jwtService: JwtService

    ) { }

    async addRefreshToken(newDevice: devicesMongo): Promise<boolean | null> {
        try {
            const query = `INSERT INTO public."devices"(
                "deviceId", "issuedAt", "expirationDate", "IP", "deviceName", "userId")
                VALUES ('${newDevice.deviceId}', '${newDevice.issuedAt}',
                        '${newDevice.expirationDate}', '${newDevice.IP}',
                        '${newDevice.deviceName}', '${newDevice.userId}');
            `
            // const res = await this.devicesMododel.query(query)
            const res = await this.entityManager
                //.getRepository(Device)
                .createQueryBuilder()
                //.relation(User, 'devices')
                //.of({deviceId: newDevice.deviceId})
                .insert()
                .into(Device)
                .values({
                    deviceId: newDevice.deviceId,
                    issuedAt: newDevice.issuedAt,
                    expirationDate: newDevice.expirationDate,
                    IP: newDevice.IP,
                    deviceName: newDevice.deviceName,
                    userId: { _id: newDevice.userId }
                })
                .execute()

            //.execute()
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

            // const query =`UPDATE public."devices"
            //                 SET "issuedAt" = '${issuedAt}',
            //                     "expirationDate" = '${expirationDate}', "IP" = '${IP}'
            //                 WHERE "userId" = $1 AND "deviceId" = $2`

            const res = await this.devicesMododel.createQueryBuilder()
                .update(Device)
                .set({
                    issuedAt: issuedAt,
                    expirationDate: expirationDate,
                    IP: IP
                })
                .where({ deviceId: deviceId })
                .andWhere({ userId: userId })
                .execute()

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
            const res = await this.devicesMododel.getRepository(Device)
                .createQueryBuilder('d')
                .leftJoinAndSelect('d.userId', 'users')
                //.select(['users._id'])
                .where('d.deviceId = :id', { id: deviceId })
                .andWhere('users._id = :userId', { userId: userId })
                .getOne()
            // query(`
            // SELECT * FROM public."devices" as d
            // WHERE d."userId" = $1 AND d."deviceId" = $2
            // `, [userId, deviceId])
            if (!res) { return null }
            //const devicesOutput: devicesPSQL = res.map((b) => {
            return {
                issuedAt: res.issuedAt,
                expirationDate: res.expirationDate,
                deviceId: res.deviceName,
                IP: res.IP,
                deviceName: res.deviceName,
                userId: res.userId._id.toString()
            }
            //})
            //return devicesOutput        
        }
        catch (e) { return null }
    }

    async deleteTokenAndDevice(userId: string, deviceId: string): Promise<true | null> {
        try {
            const res = await this.devicesMododel
                .createQueryBuilder()
                .delete()
                .from(Device)
                .where({ deviceId: deviceId })
                .andWhere({ userId: userId })
                .execute()
            // query(`
            // DELETE FROM public."devices" as d
            // WHERE d."userId" = $1 AND d."deviceId" = $2
            // `, [userId, deviceId])
            if (!res.affected) { return null }
            return true
        }
        catch (e) { return null }
    }

    async deleteDevicesAll() {
        const deletResult = await this.devicesMododel
            .createQueryBuilder()
            .delete()
            .from(Device)
            .execute()
        // query(`
        // DELETE FROM public."devices"
        // `)
        return true
    }

    async getTokenAndDevice(userId: string): Promise<devicesPSQL[] | null> {

        try {
            const res = await this.devicesMododel.getRepository(Device)
                .createQueryBuilder('d')
                .leftJoinAndSelect('d.userId', 'users')
                .select(['users._id', 'd.issuedAt', 'd.expirationDate', 'd.deviceId', 'd.IP', 'd.deviceName'])
                .where('d.userId = :userId', { userId: userId })
                .getMany()
            // query(`
            // SELECT *FROM public."devices" as u
            // WHERE u."userId" = $1
            // `, [userId])

            //find({ userId: userId }).lean();
            if (res.length === 0) { return null }
            const devicesOutput: devicesPSQL[] = res.map((b) => {
                return {
                    issuedAt: b.issuedAt,
                    expirationDate: b.expirationDate,
                    deviceId: b.deviceId,
                    IP: b.IP,
                    deviceName: b.deviceName,
                    userId: b.userId._id
                }
            })
            return devicesOutput

        }
        catch (e) { return null }
    }

    async deleteDeviceId(deviceId: string): Promise<null | true> {
        try {
            const res = await this.devicesMododel
                .createQueryBuilder()
                .delete()
                .from(Device)
                .where({ deviceId: deviceId })
                .execute()

            // query(`
            // DELETE FROM public."devices" as u
            // WHERE u."deviceId" = $1
            // `, [deviceId])
            if (!res.affected) { return null }
            return true
        }
        catch (e) { return null }
    }

    async deleteAllDevicesExceptOne(deviceId: string, userId: string): Promise<Boolean | null> {
        //добавить фильтр по userId

        try {
            const checkUserIdByDeviceId = await this.devicesMododel.getRepository(Device)
                .createQueryBuilder()
                .select()
                .where({ deviceId: deviceId })
                .andWhere({ userId: userId })
                .getOne()
            // query(`
            // SELECT * FROM public."devices" as u 
            // WHERE u."deviceId" = $1 AND u."userId" = $2
            // `, [deviceId, userId]
            // )
            if (!checkUserIdByDeviceId) { return null }
            const res = await this.devicesMododel.getRepository(Device)
                .createQueryBuilder()
                .delete()
                .where({ userId: userId })
                .andWhere({ deviceId: Not(deviceId) })
                .execute()
            // query(`
            // DELETE FROM public."devices" as d
            // WHERE d."userId" = $1 AND d."deviceId" != $2
            // `, [userId, deviceId])

            //deleteMany({ userId: userId, deviceId: { $ne: deviceId } });
            if (!res.affected) { return null }
            return true
        }
        catch (e) { return null }
    }

    async findOneDeviceId(deviceId: string): Promise<devicesPSQL | null> {
        try {
            const device = await this.devicesMododel.getRepository(Device)
                .createQueryBuilder('d')
                .leftJoinAndSelect('d.userId', 'users')
                //.select('users._id')
                .where('d.deviceId = :deviceId', { deviceId: deviceId })
                .getOne()

            // query(
            //     `SELECT * FROM public."devices" as u WHERE u."deviceId" = $1`, [deviceId]
            // );
            if (!device) { return null }
            //const deviceIdOutput : devicesPSQL = device.map((b) => {
            return {
                issuedAt: device.issuedAt,
                expirationDate: device.expirationDate,
                deviceId: device.deviceName,
                IP: device.IP,
                deviceName: device.deviceName,
                userId: device.userId._id
            }
            //})
            // return deviceIdOutput 
        }
        catch (e) { return null }
    }

    async deleteAllDevicesByUserId(userId: string): Promise<true | null> {
        //добавить фильтр по userId

        try {
            const res = await this.devicesMododel.getRepository(Device)
                .createQueryBuilder()
                .delete()
                .where({ userId: userId })
                .execute()
   
            if (!res.affected) { return null }
            return true
        }
        catch (e) { return null }
    }

}