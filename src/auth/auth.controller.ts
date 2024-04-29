import { User } from '../users/db-psql/entity/user.entity';
import { GetUserByIdCommand } from '../users/application/use-case/get.user.by.id.use.case';
import { UsersService } from '../users/application/users.service';
import { JwtService } from '../adapters/jwt-service';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Body,
  Request,
  UseGuards,
  Response,
  HttpCode,
} from '@nestjs/common';

import {
  LoginInputModel,
  NewPasswordRecoveryInputModel,
  RegistrationConfirmationCodeModel,
  RegistrationEmailResending,
  RegistrationUserInputModel,
} from './model/auth.model';
import { AuthService } from './auth.service';
import { v4 as uuidv4 } from 'uuid';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/local-jwt.guard';
import { CheckRefreshToken, EmailOrLoginGuard } from './guards/auth.guard';
import { Cookies } from './guards/cookies.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SecurityDeviceServicePSQL } from '../securityDevices/db-psql/securityDevice.service.PSQL';
import { CommandBus } from '@nestjs/cqrs';

@Controller('auth')
export class AuthController {
  constructor(
    protected usersService: UsersService,
    protected jwtService: JwtService,
    protected securityDeviceService: SecurityDeviceServicePSQL,
    protected authService: AuthService,
    protected commandBus: CommandBus,
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @Post('/login')
  async loginUserToTheSystem(
    @Request() req: any,
    @Body() loginInputData: LoginInputModel,
    @Response() res: any,
  ) {
    const deviceId = uuidv4();
    const IP = req.ip;
    const title = req.headers['user-agent'] || 'custom-ua';

    const accessToken = await this.jwtService.createdJWTAccessToken(
      req.user._id,
    );
    const user: User | null = await this.commandBus.execute(
      new GetUserByIdCommand(req.user._id),
    );
    const refreshToken =
      await this.securityDeviceService.addDeviceIdRefreshToken(
        req.user._id,
        deviceId,
        IP,
        title,
      );
    if (
      (accessToken !== null || refreshToken !== null) &&
      user!.status === false
    ) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
      });
      //res.status(200).send({ accessToken })
      res.status(200).send({ accessToken });
    } else {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(CheckRefreshToken)
  @Post('/refresh-token')
  async generateNewPairOfAccessAndRefreshTokens(
    @Request() req: any,
    @Response({ passthrough: true }) res: any,
    @Cookies('refreshToken') refreshToken: string,
  ) {
    const cookiesRefreshToken = refreshToken;
    const IP = req.ip;
    const title = req.headers['user-agent'] || 'custom-ua';
    const newAccessToken =
      await this.securityDeviceService.updateAccessToken(cookiesRefreshToken);
    const newRefreshToken =
      await this.securityDeviceService.updateDevicesModelClass(
        cookiesRefreshToken,
        IP,
        title,
      );

    if (newAccessToken !== null || newRefreshToken !== null) {
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
      });
      res.status(200).send({ accessToken: newAccessToken });
    } else {
      throw new HttpException('UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(CheckRefreshToken)
  @Post('/logout')
  async sendCorrectRefreshTokenThatWillBeRevoked(
    @Response({ passthrough: true }) res: any,
    @Cookies('refreshToken') refreshToken: string,
  ) {
    const result =
      await this.securityDeviceService.deleteDeviceIdRefreshToken(refreshToken);
    if (result === true) {
      res.clearCookie('refreshToken');
      res.status(204);
    } else {
      throw new HttpException(
        'UNAUTHORIZED no device found',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getInformationAboutCurrentUser(@Request() req: any) {
    const user = await this.usersService.findByUserId(req.user);
    return user;
  }

  @UseGuards(ThrottlerGuard, EmailOrLoginGuard)
  @Post('/registration')
  async codeWillBeSendToPassedEmailAddress(
    @Body() inputData: RegistrationUserInputModel,
  ) {
    const user = await this.authService.creatUser(
      inputData.login,
      inputData.password,
      inputData.email,
    );
    throw new HttpException('No content', HttpStatus.NO_CONTENT);
  }

  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/registration-confirmation')
  async confirmRegistrationCode(
    @Body() inputData: RegistrationConfirmationCodeModel,
  ) {
    return this.authService.confirmationCode(inputData.code);
  }
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/registration-email-resending')
  async resendConfirmationRegistrationEmail(
    @Body() inputData: RegistrationEmailResending,
  ) {
    return this.authService.resendingEmail(inputData.email);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/password-recovery')
  async passwordRecoveryViaEmail(
    @Body() inputData: RegistrationEmailResending,
  ) {
    const result = await this.authService.passwordRecovery(inputData.email);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/new-password')
  async confirmNewPasswordRecovery(
    @Body() inputData: NewPasswordRecoveryInputModel,
  ) {
    const newPassword = inputData.newPassword;
    const recoveryCode = inputData.recoveryCode;
    const result = await this.authService.newPassword(
      newPassword,
      recoveryCode,
    );
  }
}
