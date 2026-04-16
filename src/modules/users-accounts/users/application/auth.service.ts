import { PasswordService } from './../../../core/services/password.service';
import { DateService } from './../../../core/services/date.service';
import { TokenService } from './../../../core/services/token.service';
import { UserNotFoundError } from '../domain/errors/user-not-found.error';
import { UsersRepository } from './../repository/users.repository';
import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exception-filters/exceptions/domain.exception';
import { errorMessages } from '../../../core/constants/error-messages.constants';
import { DomainExceptionCode } from '../../../core/exception-filters/exceptions/domain.exception-code';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { EmailService } from '../../../core/services/email-service/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private tokenService: TokenService,
    private dateService: DateService,
    private passwordService: PasswordService,
    private emailService: EmailService,
  ) {}

  async loginUser(dto: LoginUserDto): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.getUserByLoginOrEmail(
      dto.loginOrEmail,
    );

    if (!user) {
      throw new DomainException(
        errorMessages.USER_NOT_FOUND,
        DomainExceptionCode.UNAUTHORIZED,
      );
    }

    const isVerified = await this.passwordService.verifyHash(
      user.accountData.passwordHash,
      dto.password,
    );

    if (!isVerified) {
      throw new DomainException(
        errorMessages.USER_NOT_VERIFIED,
        DomainExceptionCode.UNAUTHORIZED,
      );
    }

    const userId = user.id;
    const accessToken = await this.tokenService.createAccessToken(userId);

    // const deviceId = this.tokenService.createRandomCode();

    // const refreshToken = this.tokenService.createRefreshToken(userId, deviceId);

    // const { iat, exp } = this.tokenService.decodeRefreshToken(refreshToken);

    // if (!iat || !exp) {
    //   throw new ServerError('token issuedAt or exp is not available');
    // }

    // const newSession: SessionDbModel = {
    //   userId,
    //   deviceId,
    //   iat,
    //   exp,
    //   deviceName: dto.deviceName,
    //   ip: dto.ip,
    // };

    // await this.sessionsRepository.createSession(newSession);

    return { accessToken };
  }

  async confirmEmail(code: string): Promise<void> {
    const user =
      await this.usersRepository.getUserByConfirmationCodeOrFail(code);

    user.confirmEmail();

    await this.usersRepository.save(user);
  }

  async resendConfirmationCode(email: string): Promise<void> {
    const user = await this.usersRepository.getUserByLoginOrEmail(email);

    if (!user) {
      throw new UserNotFoundError();
    }

    const newConfirmationCode = this.tokenService.createRandomCode();
    const newExpDate = this.dateService.addHours(2);

    user.updateConfirmationInfo(newConfirmationCode, newExpDate);

    await this.usersRepository.save(user);

    this.emailService
      .sendRegistrationEmail(email, newConfirmationCode)
      .catch((err) => {
        console.log('registration resending', err);
      });
  }

  async recoverPassword(email: string): Promise<void> {
    const user = await this.usersRepository.getUserByLoginOrEmail(email);

    if (!user) return;

    const recoveryCode = this.tokenService.createRandomCode();
    const expDate = this.dateService.addHours(2);

    user.updatePasswordRecoveryInfo(recoveryCode, expDate);

    await this.usersRepository.save(user);

    this.emailService
      .sendPasswordRecoveryEmail(email, recoveryCode)
      .catch((err) => {
        console.log('password recovery', err);
      });
  }

  async updatePassword(dto: UpdatePasswordDto): Promise<void> {
    const { newPassword, recoveryCode } = dto;

    const user =
      await this.usersRepository.getUserByRecoveryCodeOrFail(recoveryCode);

    const passwordHash = await this.passwordService.generateHash(newPassword);

    user.updatePasswordHash(passwordHash);

    await this.usersRepository.save(user);
  }
}
