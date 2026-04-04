import { UsersQueryRepository } from './../repository/users-query.repository';
import { Controller, Get, Injectable, Req, UseGuards } from '@nestjs/common';
import { ROUTES } from '../../../core/constants/routes.constants';
import { JwtAuthGuard } from '../../../core/guards/jwt-auth.guard';
import type { Request } from 'express';
import { UserInfoViewDto } from './dto/view/user-info-view.dto';

@Injectable()
@Controller(ROUTES.MAIN.auth)
export class AuthController {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Req() req: Request): Promise<UserInfoViewDto> {
    const userId = req.user.userId;

    const userInfo = await this.usersQueryRepository.getUserInfo(userId);

    return userInfo;
  }
}
