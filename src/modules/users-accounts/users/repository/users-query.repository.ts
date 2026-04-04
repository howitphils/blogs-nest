import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.entity';

import type { UserDocument, UserModelType } from '../domain/user.entity';
import { PaginationViewDto } from '../../../core/dto/pagination.dto';
import { UserViewDto } from '../api/dto/view/user-view.dto';
import { createUserFilter } from './utils/create-user-filter.utility';
import { calculateSkip } from '../../../core/utils/calculate-skip';
import { UserNotFoundError } from '../domain/errors/user-not-found.error';
import { UsersQueryParams } from '../api/dto/input/user-query-params.dto';
import { UserInfoViewDto } from '../api/dto/view/user-info-view.dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getUsers(
    params: UsersQueryParams,
  ): Promise<PaginationViewDto<UserViewDto>> {
    const {
      pageNumber,
      pageSize,
      searchEmailTerm,
      searchLoginTerm,
      sortBy,
      sortDirection,
    } = params;

    const filter = createUserFilter(searchLoginTerm, searchEmailTerm);

    const users = await this.UserModel.find(filter)
      .skip(calculateSkip(pageNumber, pageSize))
      .limit(pageSize)
      .sort({ [`accountData.${sortBy}`]: sortDirection });

    const totalCount = await this.UserModel.countDocuments(filter);
    const mapedUsers = users.map((user) => this.mapFromDbToView(user));

    return PaginationViewDto.mapToView({
      items: mapedUsers,
      page: pageNumber,
      pageSize,
      totalCount,
    });
  }

  async getUserByIdOrFail(id: string): Promise<UserViewDto> {
    const user = await this.UserModel.findById(id).orFail(
      new UserNotFoundError(),
    );

    return this.mapFromDbToView(user);
  }

  async getUserInfo(userId: string): Promise<UserInfoViewDto> {
    const user = await this.UserModel.findById(userId).orFail(
      new UserNotFoundError(),
    );

    return {
      userId: user.id,
      login: user.accountData.login,
      email: user.accountData.email,
    };
  }

  // async getUsersSessions(userId: string): Promise<SessionViewModel[]> {
  //   const sessions = await SessionModel.find({ userId });

  //   return sessions.map((session) => ({
  //     ip: session.ip,
  //     deviceId: session.deviceId,
  //     lastActiveDate: session.iat,
  //     title: session.deviceName,
  //   }));
  // }

  private mapFromDbToView(user: UserDocument): UserViewDto {
    return {
      id: user.id,
      email: user.accountData.email,
      login: user.accountData.login,
      createdAt: user.accountData.createdAt,
    };
  }
}
