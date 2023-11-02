import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import mongoose from "mongoose";

export class CreatUserInputModel {
    @MaxLength(10)
    @MinLength(3)
    @IsString()
    @IsNotEmpty()
    login: string


    @MaxLength(20)
    @MinLength(6)
    @IsString()
    @IsNotEmpty()
    password: string

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string
};

export type userViewModel = {
    id: string,
    login: string,
    email: string,
    createdAt: string
}


export type userMongoModel = {
    _id: mongoose.Types.ObjectId,
    accountData: {
        login: string,
        email: string,
        salt: string,
        hash: string,
        createdAt: string
    },
    emailConfirmation: {
        confirmationCode: string,
        expiritionDate: any,
        isConfirmed: boolean,
        recoveryCode: string
    }
}


export type MeViewModel = {
    login: string,
    email: string,
    userId: mongoose.Types.ObjectId
}