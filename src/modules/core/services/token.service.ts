import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { DomainException } from '../exception-filters/exceptions/domain.exception';
import { errorMessages } from '../constants/error-messages.constants';
import { DomainExceptionCode } from '../exception-filters/exceptions/domain.exception-code';
import {
  JwtPayloadAccess,
  JwtPayloadRefresh,
} from '../types/jwt-payload.types';
import { secretKeyAccess } from '../guards/secret-key';

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async genereateToken<T extends object>(
    payload: T,
    secretKey: string,
    exp: number,
  ): Promise<string> {
    const token = await this.jwtService.signAsync(payload, {
      secret: secretKey,
      expiresIn: exp,
    });

    return token;
  }

  async verifyToken<T>(token: string, secretKey: string): Promise<T> {
    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret: secretKey,
      })) as T;

      return payload;
    } catch (error: any) {
      console.log(error);

      throw new DomainException(
        errorMessages.INVALID_TOKEN,
        DomainExceptionCode.UNAUTHORIZED,
      );
    }
  }

  //TODO: .env
  async createAccessToken(userId: string): Promise<string> {
    const token = await this.genereateToken<JwtPayloadAccess>(
      { userId },
      secretKeyAccess,
      30000,
    );

    return token;
  }

  async createRefreshToken(userId: string, deviceId: string): Promise<string> {
    const token = await this.genereateToken<JwtPayloadRefresh>(
      { deviceId, userId },
      'JWT_REFRESH_SECRET',
      100000,
    );

    return token;
  }

  async verifyAccessToken(token: string): Promise<JwtPayloadAccess> {
    const payload = await this.verifyToken<JwtPayloadAccess>(
      token,
      secretKeyAccess,
    );

    return payload;
  }

  async verifyRefreshToken(token: string): Promise<JwtPayloadRefresh> {
    const payload = await this.verifyToken<JwtPayloadRefresh>(
      token,
      'JWT_REFRESH_SECRET',
    );

    return payload;
  }

  decodeRefreshToken(token: string): JwtPayloadRefresh {
    return this.jwtService.decode(token);
  }

  createRandomCode() {
    return randomUUID();
  }
}
