import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.entity';

import type { UserDocument, UserModelType } from '../domain/user.entity';
import { UserNotFoundError } from '../domain/errors/user-not-found.error';

@Injectable()
export class UsersExternalRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async getUserByIdOrFail(id: string): Promise<UserDocument> {
    return this.UserModel.findById(id).orFail(new UserNotFoundError());
  }
}
