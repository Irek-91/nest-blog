import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import mongoose from "mongoose";

export class CreatUserInputModel {
    @ApiProperty({
        maximum: 10,
        minimum: 3,
        type: String
    })
    @MaxLength(10)
    @MinLength(3)
    @IsString()
    @IsNotEmpty()
    login: string

    @ApiProperty({
        maximum: 20,
        minimum: 6,
        type: String
    })
    @MaxLength(20)
    @MinLength(6)
    @IsString()
    @IsNotEmpty()
    password: string

    @ApiProperty({
        type: String
    })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string
};


export class UpdateStatusInputModel {
    @ApiProperty({
        type: Boolean
    })
    @IsBoolean()
    @IsNotEmpty()
    isBanned : boolean

    @ApiProperty({
        maximum: 21,
        minimum: 6,
        type: String
    })
    @MaxLength(21)
    @MinLength(6)
    @IsString()
    @IsNotEmpty()
    banReason : string
};

export class BanUserByBloggerInputModel {
    @ApiProperty({
        type: Boolean
    })
    @IsBoolean()
    @IsNotEmpty()
    isBanned : boolean

    @ApiProperty({
        minimum: 20,
        type: String
    })
    @MinLength(20)
    @IsString()
    @IsNotEmpty()
    banReason : string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    blogId : string


};
export type userViewModel = {
    id: string,
    login: string,
    email: string,
    createdAt: string,
    banInfo: banUserInfoViewModel
}
export type banUserBlogViewModel = {
    id: string,
    login: string,
    banInfo: banUserInfoViewModel
}

export type bannedUsersViewModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: banUserBlogViewModel[] | []
}


export type banUserInfoViewModel = {
    isBanned: boolean,
    banDate: string | null,
    banReason: string | null
}

export type usersViewModel = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: userViewModel[] | []
}

export type userModelPSQL = {
    _id: string,
    login: string,
    email: string,
    createdAt: string,
    salt: string,
    hash: string
}

export type emailConfirmationPSQL = {
    userId: string,
    confirmationCode: string,
    expiritionDate: any,
    isConfirmed: boolean,
    recoveryCode: string
}

export type userMongoModel = {
    _id: string,
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
    userId: mongoose.Types.ObjectId | string
}
export type userInputModel = {
    email: string,
    login: string,
    password: string,
}