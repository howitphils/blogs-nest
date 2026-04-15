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
import { AuthService } from './users/application/auth.service';
import {
  seconds,
  ThrottlerModule,
  ThrottlerStorageService,
} from '@nestjs/throttler';
import { AccessJwtStrategy } from '../core/guards/strategies/access-jwt.strategy';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from '../core/services/email-service/email.service';
import { RedisModule, RedisToken } from '@nestjs-redis/client';
import { RedisThrottlerStorage } from '@nestjs-redis/throttler-storage';
import { RedisClientType } from 'redis';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule, // TODO: update when config service will be added (register async)
    ThrottlerModule.forRootAsync({
      imports: [
        RedisModule.forRoot({ options: { url: 'redis://localhost:6379' } }),
      ],
      inject: [RedisToken()],
      useFactory: (redis: RedisClientType) => ({
        throttlers: [
          {
            ttl: seconds(10), // TODO: .env
            limit: 5,
          },
        ],
        storage: new RedisThrottlerStorage(redis),
      }),
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.yandex.by',
        port: 465,
        secure: true,
        auth: { user: 't.test1n9@yandex.by', pass: 'sekdkanopkcescog' },
      },
    }), //TODO: .env
  ],
  controllers: [UsersController, AuthController],
  providers: [
    PasswordService,
    TokenService,
    DateService,
    EmailService,
    AccessJwtStrategy,
    AuthService,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    UsersExternalRepository,
    ThrottlerStorageService,
  ],
  exports: [UsersExternalRepository, TokenService],
})
export class UsersAccountsModule {}
