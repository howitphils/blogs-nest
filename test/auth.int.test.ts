/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { UsersRepository } from './../src/modules/users-accounts/users/repository/users.repository';
import { PasswordService } from '../src/modules/core/services/password.service';
import { AuthService } from '../src/modules/users-accounts/users/application/auth.service';
import { DomainException } from '../src/modules/core/exception-filters/exceptions/domain.exception';
import { errorMessages } from '../src/modules/core/constants/error-messages.constants';
import { DomainExceptionCode } from '../src/modules/core/exception-filters/exceptions/domain.exception-code';
import { LoginInputDto } from '../src/modules/users-accounts/users/api/dto/input/login-user-input.dto';
import { app, testHelper } from './test.setup';
import { addHours } from 'date-fns';
import { TokenService } from '../src/modules/core/services/token.service';
import { DateService } from '../src/modules/core/services/date.service';

describe('AUTH API INTEGRATION', () => {
  let authService: AuthService;
  let usersRepository: UsersRepository;

  beforeAll(() => {
    authService = app.get(AuthService);
    usersRepository = app.get(UsersRepository);
  });

  describe('login', () => {
    let verifyHashMock: jest.SpiedFunction<
      (hash: string, password: string) => Promise<boolean>
    >;

    const userLogin = 'test-user';
    let loginDto: LoginInputDto;

    beforeAll(async () => {
      verifyHashMock = jest.spyOn(PasswordService.prototype, 'verifyHash');
      await testHelper.createUserInDb(userLogin);
      loginDto = testHelper.createLoginInputDto(userLogin);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
      jest.restoreAllMocks();
    });

    // const loginDto = testHelper.createLoginInfoDto('test-user');
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

  // describe('registration', () => {
  //   let userInputDto: UserInputDto;

  //   beforeAll(() => {
  //     generateHashMock.mockResolvedValue('agronhash');
  //     userInputDto = testHelper.createUserInputDto('user123');
  //   });

  //   afterEach(() => {
  //     jest.resetAllMocks();
  //   });

  //   afterAll(async () => {
  //     await testHelper.clearDatabase();
  //   });

  //   it('should create user in db and send an email', async () => {
  //     await expect(
  //       usersService.registerUser(userInputDto),
  //     ).resolves.toBeUndefined();

  //     // expect(await testHelper.countUsers()).toBe(1);

  //     const user = await usersRepository.getUserByLoginOrEmail(
  //       userInputDto.login,
  //     );

  //     expect(sendRegistrationEmailMock).toHaveBeenCalledTimes(1);
  //     expect(sendRegistrationEmailMock).toHaveBeenCalledWith(
  //       userInputDto.email,
  //       user!.emailConfirmation.confirmationCode,
  //     );
  //     expect(user!.accountData.login).toBe(userInputDto.login);
  //     expect(user!.emailConfirmation.isConfirmed).toBeFalsy();
  //   });

  //   it('should throw an error for already existing user', async () => {
  //     try {
  //       await usersService.registerUser(userInputDto);
  //       fail('error expected');
  //     } catch (error) {
  //       expect(error).toBeInstanceOf(NotUniqueUserError);

  //       const err = error as NotUniqueUserError;

  //       expect(err.status).toBe(HttpStatus.BAD_REQUEST);
  //       expect(err.errorResponse.errorsMessages).toHaveLength(1);
  //       expect(err.errorResponse.errorsMessages[0].field).toBe('email');
  //     }

  //     expect(sendRegistrationEmailMock).not.toHaveBeenCalled();
  //   });
  // });

  describe('*registration-confirmation', () => {
    let createCodeMock: jest.SpiedFunction<() => string>;
    let addDateMock: jest.SpiedFunction<(hours: number) => Date>;

    beforeAll(() => {
      createCodeMock = jest.spyOn(TokenService.prototype, 'createRandomCode');
      addDateMock = jest.spyOn(DateService.prototype, 'addHours');
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
      jest.restoreAllMocks();
    });

    it('should throw an error for not existing user', async () => {
      await expect(authService.confirmEmail('some-code')).rejects.toThrow(
        new DomainException(
          errorMessages.USER_NOT_FOUND,
          DomainExceptionCode.NOT_FOUND,
        ),
      );
    });

    it('should throw an error if email is already confirmed', async () => {
      createCodeMock.mockReturnValue('code1');
      addDateMock.mockReturnValue(new Date());
      await testHelper.createUserInDb('user1', 'email1@email.com');

      await expect(authService.confirmEmail('code1')).rejects.toThrow(
        new DomainException(
          errorMessages.EMAIL_CONFIRMED,
          DomainExceptionCode.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if code is expired', async () => {
      createCodeMock.mockReturnValue('code2');
      addDateMock.mockReturnValue(new Date());

      await testHelper.registerUser('user2', 'email2@email.com'); // creates isConfirmed:false

      await expect(authService.confirmEmail('code2')).rejects.toThrow(
        new DomainException(
          errorMessages.CONFIRMATION_CODE_EXPIRED,
          DomainExceptionCode.BAD_REQUEST,
        ),
      );
    });

    it('should update confirmation info', async () => {
      createCodeMock.mockReturnValue('code3');
      addDateMock.mockReturnValue(addHours(new Date(), 2));

      await testHelper.registerUser('user3', 'email3@email.com');

      await expect(authService.confirmEmail('code3')).resolves.toBeUndefined();

      const updatedUser =
        await usersRepository.getUserByConfirmationCodeOrFail('code3');

      expect(updatedUser.emailConfirmation.isConfirmed).toBeTruthy();
      expect(updatedUser.emailConfirmation.confirmationCode).toBe('code3');
      expect(updatedUser.emailConfirmation.expDate < new Date()).toBeTruthy();
    });
  });

  describe('email-resending', () => {
    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should throw an error for not existing user', async () => {
      await expect(
        authService.resendConfirmationCode('random@gmail.com'),
      ).rejects.toThrow(
        new DomainException(
          errorMessages.USER_NOT_FOUND,
          DomainExceptionCode.NOT_FOUND,
        ),
      );
    });

    it('should throw an error if email is already confirmed', async () => {
      const email = 'user@gmail.com';
      await testHelper.createUserInDb('user1', email);

      await expect(authService.resendConfirmationCode(email)).rejects.toThrow(
        new DomainException(
          errorMessages.EMAIL_CONFIRMED,
          DomainExceptionCode.BAD_REQUEST,
        ),
      );
    });

    it('should update confirmationCode/expDate and send an email', async () => {
      const user2Email = 'user2@gmail.com';

      await testHelper.registerUser('user2', user2Email);

      const newUser = await usersRepository.getUserByLoginOrEmail(user2Email);

      const prevCode = newUser!.emailConfirmation.confirmationCode;
      const prevDate = newUser!.emailConfirmation.expDate;

      await expect(
        authService.resendConfirmationCode(user2Email),
      ).resolves.toBeUndefined();

      const updatedUser =
        await usersRepository.getUserByLoginOrEmail(user2Email);

      expect(updatedUser!.emailConfirmation.isConfirmed).toBeFalsy();
      expect(updatedUser!.emailConfirmation.confirmationCode).not.toBe(
        prevCode,
      );
      expect(updatedUser!.emailConfirmation.expDate > prevDate).toBeTruthy();

      // expect(
      //   emailService.sendRegistrationEmail.bind(this),
      // ).toHaveBeenCalledTimes(1);
      // expect(
      //   emailService.sendRegistrationEmail.bind(this),
      // ).toHaveBeenCalledWith(
      //   user2Email,
      //   updatedUser!.emailConfirmation.confirmationCode,
      // );
    });
  });

  describe('recover password', () => {
    const email = 'user@gmail.com';
    const recoveryCode = 'recovery_code_1'; // To make new recovery code in usersService predictable
    let userId: string;

    beforeAll(async () => {
      jest
        .spyOn(TokenService.prototype, 'createRandomCode')
        .mockReturnValue(recoveryCode);

      userId = await testHelper.createUserInDb('user1', email);
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should resolve with undefined for not existing user', async () => {
      await expect(
        authService.recoverPassword('nonexistent@gmail.com'),
      ).resolves.toBeUndefined();

      // expect(sendPasswordRecoveryEmailMock).not.toHaveBeenCalled();
    });

    it("should update user's recovery code and expDate", async () => {
      await expect(authService.recoverPassword(email)).resolves.toBeUndefined();

      // expect(sendPasswordRecoveryEmailMock).toHaveBeenCalledTimes(1);
      // expect(sendPasswordRecoveryEmailMock).toHaveBeenCalledWith(
      //   email,
      //   recoveryCode,
      // );

      const updatedUser = await usersRepository.getUserByIdOrFail(userId);

      expect(updatedUser.passwordRecovery.recoveryCode).toBe(recoveryCode);
      expect(updatedUser.passwordRecovery.expDate > new Date()).toBeTruthy();
    });
  });

  describe('update password', () => {
    let createCodeMock: jest.SpiedFunction<() => string>;
    let addDateMock: jest.SpiedFunction<(hours: number) => Date>;
    let generateHashMock: jest.SpiedFunction<
      (password: string) => Promise<string>
    >;

    beforeAll(() => {
      generateHashMock = jest.spyOn(PasswordService.prototype, 'generateHash');
      createCodeMock = jest.spyOn(TokenService.prototype, 'createRandomCode');
      addDateMock = jest.spyOn(DateService.prototype, 'addHours');
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should throw an error for not existing user', async () => {
      await expect(
        authService.updatePassword({
          newPassword: '123561',
          recoveryCode: 'some-code',
        }),
      ).rejects.toThrow(
        new DomainException(
          errorMessages.USER_NOT_FOUND,
          DomainExceptionCode.NOT_FOUND,
        ),
      );
    });

    it('should throw an error for expired recovery code', async () => {
      createCodeMock.mockReturnValue('code');
      addDateMock.mockReturnValue(new Date());
      generateHashMock.mockResolvedValue('some-hash');

      await testHelper.createUserInDb('user1', 'email@emai22.com');

      await expect(
        authService.updatePassword({
          newPassword: '123432',
          recoveryCode: 'code',
        }),
      ).rejects.toThrow(
        new DomainException(
          errorMessages.RECOVERY_CODE_EXPIRED,
          DomainExceptionCode.BAD_REQUEST,
        ),
      );
    });

    it('should successfully update password hash and reset password recovery info', async () => {
      createCodeMock.mockReturnValue('code2');
      addDateMock.mockReturnValue(addHours(new Date(), 2));
      generateHashMock.mockResolvedValue('old-hash');

      const userId = await testHelper.createUserInDb(
        'user2',
        'email@emai222l.com',
      );

      await expect(
        authService.updatePassword({
          newPassword: '123456',
          recoveryCode: 'code2',
        }),
      ).resolves.toBeUndefined();

      const user = await usersRepository.getUserByIdOrFail(userId);

      expect(user.accountData.passwordHash).not.toBe('old-hash');
      expect(user.passwordRecovery.recoveryCode).toBeNull();
      expect(user.passwordRecovery.expDate < new Date()).toBeTruthy();
    });
  });
});
