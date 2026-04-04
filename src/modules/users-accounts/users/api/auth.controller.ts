import { UsersService } from './../application/users.service';
import { AuthService } from './../application/auth.service';
import { UsersQueryRepository } from './../repository/users-query.repository';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ROUTES } from '../../../core/constants/routes.constants';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import type { Request } from 'express';
import { UserInfoViewDto } from './dto/view/user-info-view.dto';
import { LoginInputDto } from './dto/input/login-user-input.dto';
import { UserInputDto } from './dto/input/create-user-input.dto';
import { ConfirmEmailInputDto } from './dto/input/confirm-email-input.dto';
import { EmailResendingInputDto } from './dto/input/email-resending-input.dto';
import { UpdatePasswordInputDto } from './dto/input/update-password-input.dto';

//TODO: throttler

@Injectable()
@Controller(ROUTES.MAIN.auth)
export class AuthController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Req() req: Request): Promise<UserInfoViewDto> {
    const userId = req.user.userId;

    const userInfo = await this.usersQueryRepository.getUserInfo(userId);

    return userInfo;
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registerUser(@Body() body: UserInputDto): Promise<void> {
    const { email, login, password } = body;

    await this.usersService.registerUser({
      email,
      login,
      password,
    });
  }

  @Post('login')
  async loginUser(
    @Body() body: LoginInputDto,
  ): Promise<{ accessToken: string }> {
    const { loginOrEmail, password } = body;

    const accessToken = await this.authService.loginUser({
      loginOrEmail,
      password,
    });

    return accessToken;
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() body: ConfirmEmailInputDto): Promise<void> {
    const { code } = body;

    await this.authService.confirmEmail(code);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationCode(
    @Body() body: EmailResendingInputDto,
  ): Promise<void> {
    const { email } = body;

    await this.authService.resendConfirmationCode(email);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoverPassword(@Body() body: EmailResendingInputDto): Promise<void> {
    const { email } = body;

    await this.authService.recoverPassword(email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(@Body() body: UpdatePasswordInputDto): Promise<void> {
    const { newPassword, recoveryCode } = body;

    await this.authService.updatePassword({ newPassword, recoveryCode });
  }
}
