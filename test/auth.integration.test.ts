import {
  describe,
  it,
  beforeAll,
  afterAll,
  afterEach,
  jest,
  expect,
} from '@jest/globals';
import { Test } from '@nestjs/testing';
import { UsersRepository } from '../src/modules/users-accounts/users/repository/users.repository';
import { PasswordService } from '../src/modules/core/services/password.service';
import { TokenService } from '../src/modules/core/services/token.service';
import { DateService } from '../src/modules/core/services/date.service';
import { EmailServiceMock } from './mocks/email-service.mock';
import { testHelper } from './test.setup';
import { AuthService } from '../src/modules/users-accounts/users/application/auth.service';
import { DomainException } from '../src/modules/core/exception-filters/exceptions/domain.exception';
import { errorMessages } from '../src/modules/core/constants/error-messages.constants';
import { DomainExceptionCode } from '../src/modules/core/exception-filters/exceptions/domain.exception-code';

describe('AUTH API INTEGRATION', () => {
  let authService: AuthService;
  let verifyHashMock: jest.SpiedFunction<
    (hash: string, password: string) => Promise<boolean>
  >;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersRepository,
        PasswordService,
        TokenService,
        DateService,
        EmailServiceMock,
      ],
    }).compile();

    authService = moduleFixture.get(AuthService);

    verifyHashMock = jest.spyOn(PasswordService.prototype, 'verifyHash');
  });

  describe('login', () => {
    beforeAll(async () => {
      await testHelper.createUserInDb('test-user');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    // const loginDto = testHelper.createLoginInfoDto('test-user');
    const loginDto = testHelper.createLoginInputDto('test-user');

    it('should throw an error for not existing user', async () => {
      const invalidLoginDto = testHelper.createLoginInputDto('some-user');

      await expect(authService.loginUser(invalidLoginDto)).rejects.toThrow(
        new DomainException(
          errorMessages.USER_NOT_FOUND,
          DomainExceptionCode.NOT_FOUND,
        ),
      );

      expect(verifyHashMock).not.toHaveBeenCalled();
    });

    it('should throw an error if user is not verified', async () => {
      verifyHashMock.mockResolvedValue(false);

      await expect(authService.loginUser(loginDto)).rejects.toThrow(
        new DomainException(
          errorMessages.USER_NOT_VERIFIED,
          DomainExceptionCode.UNAUTHORIZED,
        ),
      );

      expect(verifyHashMock).toHaveBeenCalledTimes(1);
    });

    it('should return a token pair object and create a session', async () => {
      verifyHashMock.mockResolvedValue(true);

      await expect(authService.loginUser(loginDto)).resolves.toEqual({
        accessToken: expect.stringContaining('.'),
        // refreshToken: expect.stringContaining('.'),
      });

      expect(verifyHashMock).toHaveBeenCalledTimes(1);

      // expect(await testHelper.countSessions()).toBe(1);
    });
  });

  describe('registration', () => {
    beforeAll(() => {
      sendRegistrationEmailMock.mockResolvedValue();
      passwordServiceMock.generateHash.mockResolvedValue('argonhash');
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    const userInputDto = testHelper.createUserInputDto('user123');

    it('should create user in db and send an email', async () => {
      await expect(
        usersService.registerUser(userInputDto),
      ).resolves.toBeUndefined();

      expect(await testHelper.countUsers()).toBe(1);

      const user = await usersRepository.getUserByLoginOrEmail(
        userInputDto.login,
      );

      expect(sendRegistrationEmailMock).toHaveBeenCalledTimes(1);
      expect(sendRegistrationEmailMock).toHaveBeenCalledWith(
        userInputDto.email,
        user!.emailConfirmation.confirmationCode,
      );
      expect(user!.accountData.login).toBe(userInputDto.login);
      expect(user!.emailConfirmation.isConfirmed).toBeFalsy();
    });

    it('should throw an error for already existing user', async () => {
      try {
        await usersService.registerUser(userInputDto);
        fail('error expected');
      } catch (error) {
        expect(error).toBeInstanceOf(NotUniqueUserError);

        const err = error as NotUniqueUserError;

        expect(err.status).toBe(HttpStatus.BAD_REQUEST);
        expect(err.errorResponse.errorsMessages).toHaveLength(1);
        expect(err.errorResponse.errorsMessages[0].field).toBe('email');
      }

      expect(sendRegistrationEmailMock).not.toHaveBeenCalled();
    });
  });

  describe('*registration-confirmation', () => {
    afterEach(async () => {
      await testHelper.clearDatabase();
    });

    it('should throw an error for not existing user', async () => {
      await expect(usersService.confirmEmail('some-code')).rejects.toThrow(
        new UserNotFoundError(),
      );
    });

    it('should throw an error if email is already confirmed', async () => {
      await testHelper.createUserInDb({
        emailConfirmation: {
          confirmationCode: 'user1-code',
          isConfirmed: true,
        },
      });

      await expect(usersService.confirmEmail('user1-code')).rejects.toThrow(
        new BadRequestError('Email is already confirmed'),
      );
    });

    it('should throw an error if code is expired', async () => {
      await testHelper.createUserInDb({
        emailConfirmation: {
          confirmationCode: 'user2-code',
          expDate: dateService.addSeconds(-10),
        },
      });

      await expect(usersService.confirmEmail('user2-code')).rejects.toThrow(
        new BadRequestError('Confirmation code is already expired'),
      );
    });

    it('should update isConfirmed status and return true', async () => {
      const user3Code = 'user3-code';

      await testHelper.createUserInDb({
        emailConfirmation: { confirmationCode: user3Code },
      });

      await expect(
        usersService.confirmEmail(user3Code),
      ).resolves.toBeUndefined();

      const user =
        await usersRepository.getUserByConfirmationCodeOrFail(user3Code);

      expect(user!.emailConfirmation.isConfirmed).toBeTruthy();
      expect(user!.emailConfirmation.confirmationCode).toBe(user3Code);
      expect(user!.emailConfirmation.expDate < new Date()).toBeTruthy();
    });
  });

  describe('email-resending', () => {
    beforeAll(() => {
      sendRegistrationEmailMock.mockResolvedValue();
    });

    afterEach(async () => {
      await testHelper.clearDatabase();
    });

    it('should throw an error for not existing user', async () => {
      await expect(
        usersService.resendEmail('random@gmail.com'),
      ).rejects.toThrow(new UserNotFoundError());

      expect(sendRegistrationEmailMock).not.toHaveBeenCalled();
    });

    it('should throw an error if email is already confirmed', async () => {
      const email = 'user@gmail.com';
      await testHelper.createUserInDb({
        accountData: { email },
        emailConfirmation: {
          isConfirmed: true,
        },
      });

      await expect(usersService.resendEmail(email)).rejects.toThrow(
        new BadRequestError('Email is already confirmed'),
      );

      expect(sendRegistrationEmailMock).not.toHaveBeenCalled();
    });

    it('should update confirmationCode/expDate and send an email', async () => {
      const oldCode = 'code';
      const oldExp = new Date();
      const user2Email = 'user2@gmail.com';

      await testHelper.createUserInDb({
        accountData: { email: user2Email },
        emailConfirmation: {
          confirmationCode: oldCode,
          expDate: oldExp,
        },
      });

      await expect(
        usersService.resendEmail(user2Email),
      ).resolves.toBeUndefined();

      const user = await usersRepository.getUserByLoginOrEmail(user2Email);

      expect(user!.emailConfirmation.isConfirmed).toBeFalsy();
      expect(user!.emailConfirmation.confirmationCode).not.toBe(oldCode);
      expect(user!.emailConfirmation.expDate > oldExp).toBeTruthy();

      expect(sendRegistrationEmailMock).toHaveBeenCalledTimes(1);
      expect(sendRegistrationEmailMock).toHaveBeenCalledWith(
        user2Email,
        user!.emailConfirmation.confirmationCode,
      );
    });
  });

  describe('recover password', () => {
    const email = 'user@gmail.com';
    const recoveryCode = tokenService.createRandomCode(); // To make new recovery code in usersService predictable
    let userId: string;

    beforeAll(async () => {
      jest
        .spyOn(TokenService.prototype, 'createRandomCode')
        .mockReturnValue(recoveryCode);

      sendPasswordRecoveryEmailMock.mockResolvedValue();

      userId = await testHelper.createUserInDb({
        accountData: { email },
        emailConfirmation: { isConfirmed: true },
      });
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should resolve with undefined for not existing user', async () => {
      await expect(
        usersService.recoverPassword('nonexistent@gmail.com'),
      ).resolves.toBeUndefined();

      expect(sendPasswordRecoveryEmailMock).not.toHaveBeenCalled();
    });

    it("should update user's recovery code and expDate", async () => {
      await expect(
        usersService.recoverPassword(email),
      ).resolves.toBeUndefined();

      expect(sendPasswordRecoveryEmailMock).toHaveBeenCalledTimes(1);
      expect(sendPasswordRecoveryEmailMock).toHaveBeenCalledWith(
        email,
        recoveryCode,
      );

      const updatedUser = await usersRepository.getUserByIdOrFail(userId);

      expect(updatedUser.passwordRecovery.recoveryCode).toBe(recoveryCode);
      expect(updatedUser.passwordRecovery.expDate > new Date()).toBeTruthy();
    });
  });

  describe('update password', () => {
    beforeAll(() => {
      passwordServiceMock.generateHash.mockResolvedValue('1234');
    });

    afterEach(async () => {
      await testHelper.clearDatabase();
    });

    it('should throw an error for not existing user', async () => {
      await expect(
        usersService.updatePassword('123456', 'some-code'),
      ).rejects.toThrow(new UserNotFoundError());
    });

    it('should throw an error for expired recovery code', async () => {
      await testHelper.createUserInDb({
        passwordRecovery: {
          recoveryCode: 'code',
          expDate: dateService.addSeconds(-10),
        },
      });

      await expect(
        usersService.updatePassword('123456', 'code'),
      ).rejects.toThrow(
        new BadRequestError('Recovery code is already expired'),
      );
    });

    it('should successfully update password hash and reset password recovery info', async () => {
      const userId = await testHelper.createUserInDb({
        accountData: { passwordHash: 'old-hash' },
        passwordRecovery: {
          recoveryCode: 'code2',
          expDate: dateService.addHours(2),
        },
      });

      await expect(
        usersService.updatePassword('123456', 'code2'),
      ).resolves.toBeUndefined();

      const user = await usersRepository.getUserByIdOrFail(userId);

      expect(user.accountData.passwordHash).not.toBe('old-hash');
      expect(user.passwordRecovery.recoveryCode).toBeNull();
      expect(user.passwordRecovery.expDate < new Date()).toBeTruthy();
    });
  });
});
