import { log } from 'console';
import { settings } from './../settings';
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";
import { Injectable } from "@nestjs/common"

@Injectable()
export class JwtService {
    async createdJWTAccessToken (userId : string) {
        const accessToken = jwt.sign({userId : userId}, settings.JWT_SECRET, {expiresIn: 12})
        return accessToken
    }

    async createdJWTRefreshToken (userId: string, deviceId: string): Promise< string> {
        const refreshToken = jwt.sign({userId: userId, deviceId: deviceId}, settings.JWT_SECRET, {expiresIn: 22})
        return refreshToken
    }

    
    async getUserIdByToken (token: string) : Promise<string | null> {
       
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return result.userId
        } 
        catch (e) {
            
            return null
        }
    }

    async getUserIdByRefreshToken (token: string) : Promise<string> {
            const result: any = jwt.decode(token)
            return result.userId
        
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
        const result: any = jwt.verify(token, settings.JWT_SECRET)
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
