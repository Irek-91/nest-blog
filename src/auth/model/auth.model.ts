import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginInputModel {
  @IsNotEmpty()
  @IsString()
  loginOrEmail: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class RegistrationConfirmationCodeModel {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class RegistrationEmailResending {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class NewPasswordRecoveryInputModel {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @MinLength(6)
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  recoveryCode: string;
}

export class RegistrationUserInputModel {
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  @MinLength(3)
  login: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}
