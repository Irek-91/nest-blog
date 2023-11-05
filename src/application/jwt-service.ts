import { log } from 'console';
import { settings } from './../settings';
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
import { Injectable } from "@nestjs/common"

@Injectable()
export class JwtService {
    async createdJWTAccessToken (userId : mongoose.Types.ObjectId) {
        const accessToken = jwt.sign({userId : userId}, settings.JWT_SECRET, {expiresIn: 600})
        return accessToken
    }

    async createdJWTRefreshToken (userId: mongoose.Types.ObjectId, deviceId: string): Promise< string> {
        const refreshToken = jwt.sign({userId: userId, deviceId: deviceId}, settings.JWT_SECRET, {expiresIn: 400})
        return refreshToken
    }

    
    async getUserIdByToken (token: string) : Promise<mongoose.Types.ObjectId | null> {
       
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return new mongoose.Types.ObjectId(result.userId)
        } 
        catch (e) {
            
            return null
        }
    }

    async getUserIdByRefreshToken (token: string) : Promise<mongoose.Types.ObjectId> {
            const result: any = jwt.decode(token)
            return new mongoose.Types.ObjectId(result.userId)
        
    }
    async getPayloadByRefreshToken (token: string) : Promise<any> {
        try{
        const payload: any = jwt.verify(token, settings.JWT_SECRET)
        return payload.userId}
        catch (e) {
            return null
        }

    
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
