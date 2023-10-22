import { IsNotEmpty, IsString } from "class-validator"

export class LoginInputModel {
    @IsNotEmpty()
    @IsString()
    loginOrEmail: string
    
    @IsNotEmpty()
    @IsString()
    password: string
}