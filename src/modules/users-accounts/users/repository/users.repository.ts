import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';

import type { UserDocument, UserModelType } from './../domain/user.entity';
import { UserNotFoundError } from '../domain/errors/user-not-found.error';
import { safeRegex } from '../../../core/utils/safe-regex';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async save(user: UserDocument) {
    await user.save();
  }

  async getUserByIdOrFail(id: string): Promise<UserDocument> {
    return this.UserModel.findById(id).orFail(new UserNotFoundError());
  }

  async deleteUser(userId: string): Promise<UserDocument> {
    return this.UserModel.findByIdAndDelete(userId).orFail(
      new UserNotFoundError(),
    );
  }

  async getExistingUser(
    login: string,
    email: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [
        {
          'accountData.login': {
            $regex: `^${safeRegex(login)}$`, // ^ - start of the string, $ - end of the string
            $options: 'i',
          },
        },
        {
          'accountData.email': {
            $regex: `^${safeRegex(email)}$`,
            $options: 'i',
          },
        },
      ],
    });
  }

  async getUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [
        {
          'accountData.login': {
            $regex: `^${safeRegex(loginOrEmail)}$`,
            $options: 'i',
          },
        },
        {
          'accountData.email': {
            $regex: `^${safeRegex(loginOrEmail)}$`,
            $options: 'i',
          },
        },
      ],
    });
  }

  async getUserByConfirmationCodeOrFail(code: string): Promise<UserDocument> {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    }).orFail(new UserNotFoundError());
  }

  async getUserByRecoveryCodeOrFail(
    recoveryCode: string,
  ): Promise<UserDocument> {
    return this.UserModel.findOne({
      'passwordRecovery.recoveryCode': recoveryCode,
    }).orFail(new UserNotFoundError());
  }
}
