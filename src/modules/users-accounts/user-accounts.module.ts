import { Module } from '@nestjs/common';
import { PasswordService } from '../core/services/password.service';
import { UsersService } from './users/application/users.service';
import { UsersRepository } from './users/repository/users.repository';
import { UsersQueryRepository } from './users/repository/users-query.repository';
import { TokenService } from '../core/services/token.service';
import { DateService } from '../core/services/date.service';
import { UsersController } from './users/api/users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users/domain/user.entity';
import { UsersExternalRepository } from './users/repository/users-external.repository';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './users/api/auth.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule, // TODO: update when config service will be added
  ],
  controllers: [UsersController, AuthController],
  providers: [
    PasswordService,
    TokenService,
    DateService,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    UsersExternalRepository,
  ],
  exports: [UsersExternalRepository, TokenService],
})
export class UsersAccountsModule {}
