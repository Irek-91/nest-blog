import { log } from 'console';
import { settings } from './../settings';
import jwt from 'jsonwebtoken'
import mongoose, { ObjectId } from "mongoose";


export class JwtService {
    async createdJWTAccessToken (userId : ObjectId) {
        const accessToken = jwt.sign({userId : userId}, settings.JWT_SECRET, {expiresIn: 600})
        return accessToken
    }

    async createJWTRefreshToken (userId: ObjectId, deviceId: string): Promise< string> {
        const refreshToken = jwt.sign({userId: userId, deviceId: deviceId}, settings.JWT_SECRET, {expiresIn: 200})
        return refreshToken
    }

    
    async getUserIdByToken (token: string) : Promise<ObjectId | null> {
       
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return new ObjectId(result.userId)
        } 
        catch (e) {
            
            return null
        }
    }

    async getUserIdByRefreshToken (token: string) : Promise<ObjectId> {
            const result: any = jwt.decode(token)
            return new ObjectId(result.userId)
        
    }

    async getDeviceIdByRefreshToken (token: string) : Promise<string> {
            const result: any = jwt.decode(token)
            return result.deviceId
    }


    async getIssuedAttByRefreshToken (token: string) : Promise<string | null> {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return (new Date ((result.iat)*1000)).toISOString()
        }
        catch (e) {
            return null
        }
    }

    async getExpiresAttByRefreshToken (token: string) : Promise<string> {
            const result: any = jwt.decode(token)
            return (new Date ((result.exp)*1000)).toISOString()
    }


    async getIssueAttByRefreshToken (token: string) : Promise<string> {
        const result: any = jwt.decode(token)
        return (new Date ((result.iat)*1000)).toISOString()
    }

    async checkingTokenKey (token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return result
        } 
        catch (e) {
            return null
        }
    }
    
    async getUserIdByAccessToken (token: string) : Promise<string | null> {
       
            const result: any = jwt.decode(token)
            return result.userId
        
    }
}