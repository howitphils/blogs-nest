/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  describe,
  it,
  beforeAll,
  beforeEach,
  expect,
  afterAll,
  afterEach,
} from '@jest/globals';
import { HttpStatus } from '@nestjs/common';
import { DateService } from '../src/modules/core/services/date.service';
import { PasswordService } from '../src/modules/core/services/password.service';
import { TokenService } from '../src/modules/core/services/token.service';
import { testHelper, req, app } from './test.setup';
import { LoginInputDto } from '../src/modules/users-accounts/users/api/dto/input/login-user-input.dto';
import { UserInputDto } from '../src/modules/users-accounts/users/api/dto/input/create-user-input.dto';
import { errorMessages } from '../src/modules/core/constants/error-messages.constants';
import { createUserInputRestrictions } from '../src/modules/users-accounts/users/api/dto/input/restrictions/create-user-input.restrictions';

describe('AUTH API E2E', () => {
  let tokenService: TokenService;
  let dateService: DateService;

  beforeAll(() => {
    tokenService = app.get(TokenService);
    dateService = app.get(DateService);
  });

  describe('POST /login', () => {
    let userInputDto: UserInputDto;

    beforeAll(async () => {
      userInputDto = testHelper.createUserInputDto();
      await testHelper.createUserInDb(userInputDto.login, userInputDto.email);
    });

    // afterEach(async () => {
    //   await testHelper.clearRedis();
    // });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should login a user', async () => {
      const loginInputDto: LoginInputDto = testHelper.createLoginInputDto(
        userInputDto.login,
        userInputDto.password,
      );

      const loginInputDtoEmail: LoginInputDto = testHelper.createLoginInputDto(
        userInputDto.email,
        userInputDto.password,
      );

      const resArr = await Promise.all([
        req.post('/auth/login').send(loginInputDto),
        req.post('/auth/login').send(loginInputDtoEmail),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body).toEqual({ accessToken: expect.stringContaining('.') });

        // const refreshCookie = res.headers['set-cookie'][0];
        // const parsedCookie = cookieHelper.parseCookie(refreshCookie);

        // expect(parsedCookie.name).toBe(appConfig.REFRESH_COOKIE_NAME);
        // expect(parsedCookie.value).toContain('.');
        // expect(parsedCookie.params.httponly).toBeTruthy();
        // expect(parsedCookie.params.secure).toBeTruthy();
      }
    });

    it('should return 400 for invalid login data', async () => {
      const invalidFormatValues = testHelper.createLoginInputDto(222, 124567);
      const emptyValues = testHelper.createLoginInputDto('', '');
      const whiteSpacesValues = testHelper.createLoginInputDto('    ', '     ');

      const resArr = await Promise.all([
        req.post('/auth/login').send(invalidFormatValues),
        req.post('/auth/login').send(emptyValues),
        req.post('/auth/login').send(whiteSpacesValues),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages.length).toBe(2);
      }
    });

    it('should return 401 for not existing user', async () => {
      const notExistingUserLogin = testHelper.createLoginInputDto('user999');

      const res = await req.post('/auth/login').send(notExistingUserLogin);

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toBe(errorMessages.USER_NOT_FOUND);
    });

    it('should return 401 for incorrect password', async () => {
      const incorrectPassDto = testHelper.createLoginInputDto(
        userInputDto.login,
        'incorrectPass',
      );

      const res = await req.post('/auth/login').send(incorrectPassDto);

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe(errorMessages.USER_NOT_VERIFIED);
    });

    // it('should return 429 after 5 login attempts', async () => {
    //   await testHelper.makeRequestsLimit('/auth/login');

    //   const res = await req.post('/auth/login').send({});

    //   expect(res.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    // });
  });

  describe('GET /me', () => {
    let token: string;

    beforeAll(async () => {
      const userId = await testHelper.createUserInDb(
        'user1',
        'email1@gmail.com',
      );

      token = await tokenService.createAccessToken(userId);
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it("should return user's info", async () => {
      const res = await req
        .get('/auth/me')
        .set('Authorization', testHelper.getBearerAuthHeader(token));

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toEqual({
        login: 'user1',
        email: 'email1@gmail.com',
        userId: expect.any(String),
      });
    });

    it('should return 401 for unauthorized user', async () => {
      const res = await req
        .get('/auth/me')
        .set('Authorization', 'Invalid Token');

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /registration', () => {
    beforeEach(() => {
      testHelper.clearRedis();
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
      testHelper.clearRedis();
    });

    it('should return 400 and an error for not unique user', async () => {
      await testHelper.createUserInDb('login1', 'email1@gmail.com');

      const sameLoginDto = testHelper.createUserInputDto('login1');
      const sameEmailDto = testHelper.createUserInputDto(
        'different',
        'email1@gmail.com',
      );

      const resArr = await Promise.all([
        req.post('/auth/registration').send(sameLoginDto),
        req.post('/auth/registration').send(sameEmailDto),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages.length).toBe(1);
      }

      expect(resArr[0].body.errorsMessages[0].field).toBe('login');
      expect(resArr[1].body.errorsMessages[0].field).toBe('email');
    });

    it('should return 400 for invalid user data', async () => {
      const invalidUserMinValues = {
        login: 'a'.repeat(createUserInputRestrictions.login.minLength - 1),
        email: '',
        password: 'a'.repeat(
          createUserInputRestrictions.password.minLength - 1,
        ),
      };

      const invalidUserMaxValues = {
        login: 'a'.repeat(createUserInputRestrictions.login.maxLength + 1),
        email: 123,
        password: 'a'.repeat(
          createUserInputRestrictions.password.maxLength + 1,
        ),
      };

      const invalidFormatValues = {
        login: 234,
        email: 'email',
        password: 1234567,
      };

      const whiteSpacesValues = {
        login: '   ',
        email: '   ',
        password: '   ',
      };

      const resArr = await Promise.all([
        req.post('/auth/registration').send(invalidUserMinValues),
        req.post('/auth/registration').send(invalidUserMaxValues),
        req.post('/auth/registration').send(invalidFormatValues),
        req.post('/auth/registration').send(whiteSpacesValues),
        req.post('/auth/registration').send({}),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages).toHaveLength(3);
      }
    });

    // it('should return 429 after 5 registration attempts', async () => {
    //   await testHelper.makeRequestsLimit('/auth/registration');

    //   const res = await req.post('/auth/registration').send({});

    //   expect(res.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    // });
  });

  // describe('POST /refresh-token', () => {
  //   let cookie: string;
  //   let oldAccessToken: string;
  //   let oldRefreshToken: string;

  //   beforeAll(async () => {
  //     jest
  //       .spyOn(PasswordService.prototype, 'verifyHash')
  //       .mockResolvedValue(true);

  //     await testHelper.createUserInDb({
  //       accountData: { login: 'user1' },
  //     });

  //     const loginDto = testHelper.createLoginInputDto('user1');

  //     const loginRes = await testHelper.loginUser(loginDto);

  //     cookie = loginRes.cookie;
  //     oldAccessToken = loginRes.accessToken;
  //     oldRefreshToken = cookieHelper.parseCookie(cookie).value;
  //   });

  //   afterAll(async () => {
  //     await testHelper.clearDatabase();
  //     await testHelper.clearRedis();

  //     jest.restoreAllMocks();
  //   });

  //   it('should return new access token in body and new refresh token in cookie', async () => {
  //     // For tokens to become different and for session to be added to db after login in beforAll
  //     await testHelper.delay(1000);

  //     const res = await req.post('/auth/refresh-token').set('Cookie', cookie);

  //     const newRefreshToken = cookieHelper.parseCookie(
  //       res.headers['set-cookie'][0],
  //     ).value;

  //     expect(res.status).toBe(HttpStatus.OK);
  //     expect(res.body).toEqual({ accessToken: expect.stringContaining('.') });
  //     expect(res.body.accessToken).not.toBe(oldAccessToken);
  //     expect(newRefreshToken).not.toBe(oldRefreshToken);
  //   });

  //   it('should return 401 if old refresh token is provided', async () => {
  //     const res = await req
  //       .post('/auth/refresh-token')
  //       .set('Cookie', `${appConfig.REFRESH_COOKIE_NAME}=${oldRefreshToken}`);

  //     expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  //     expect(res.body.message).toBe('Token is not valid');
  //   });

  //   it('should return 401 if cookie is not provided', async () => {
  //     const res = await req.post('/auth/refresh-token');

  //     expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  //     expect(res.body.message).toBe('Token is not found');
  //   });

  //   it('should return 401 if accessToken is provided instead of refreshToken', async () => {
  //     const res = await req
  //       .post('/auth/refresh-token')
  //       .set('Cookie', `${appConfig.REFRESH_COOKIE_NAME}=${oldAccessToken}`);

  //     expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  //     expect(res.body.message).toBe('Token is not verified');
  //   });
  // });

  // describe('POST /logout', () => {
  //   let cookie: string;
  //   let oldAccessToken: string;
  //   let oldRefreshToken: string;

  //   beforeAll(async () => {
  //     jest
  //       .spyOn(PasswordService.prototype, 'verifyHash')
  //       .mockResolvedValue(true);

  //     await testHelper.createUserInDb({
  //       accountData: { login: 'user1' },
  //     });
  //     const loginDto = testHelper.createLoginInputDto('user1');
  //     const loginRes = await testHelper.loginUser(loginDto);

  //     cookie = loginRes.cookie;
  //     oldAccessToken = loginRes.accessToken;
  //     oldRefreshToken = cookieHelper.parseCookie(cookie).value;
  //   });

  //   afterAll(async () => {
  //     await testHelper.clearDatabase();
  //     await testHelper.clearRedis();

  //     jest.restoreAllMocks();
  //   });

  //   it('should clear refresh token cookie', async () => {
  //     const res = await req.post('/auth/logout').set('Cookie', cookie);

  //     const clearedCookie = res.headers['set-cookie'][0];
  //     const parsedClearedCookie = cookieHelper.parseCookie(clearedCookie);

  //     expect(res.status).toBe(HttpStatus.NO_CONTENT);
  //     expect(parsedClearedCookie.name).toBe(appConfig.REFRESH_COOKIE_NAME);
  //     expect(parsedClearedCookie.value).toBe('');
  //     expect(parsedClearedCookie.params.httponly).toBeTruthy();
  //     expect(parsedClearedCookie.params.secure).toBeTruthy();
  //   });

  //   it('should return 401 if cookie is not provided', async () => {
  //     const res = await req.post('/auth/logout');

  //     expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  //     expect(res.body.message).toBe('Token is not found');
  //   });

  //   it('should return 401 if accessToken is provided instead of refreshToken', async () => {
  //     const res = await req
  //       .post('/auth/logout')
  //       .set('Cookie', `${appConfig.REFRESH_COOKIE_NAME}=${oldAccessToken}`);

  //     expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  //     expect(res.body.message).toBe('Token is not verified');
  //   });

  //   it('should return 404 if trying to logout from already deleted session', async () => {
  //     const res = await req
  //       .post('/auth/logout')
  //       .set('Cookie', `${appConfig.REFRESH_COOKIE_NAME}=${oldRefreshToken}`);

  //     expect(res.status).toBe(HttpStatus.NOT_FOUND);
  //     expect(res.body.message).toBe('Session was not found');
  //   });
  // });

  describe('POST /password-recovery', () => {
    // afterEach(async () => {
    //   await testHelper.clearRedis();
    // });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should return 204 even if email is not associated with any user', async () => {
      const res = await req
        .post('/auth/password-recovery')
        .send({ email: 'some-email@gmail.com' });

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return 400 for invalid email format', async () => {
      const resArr = await Promise.all([
        req.post('/auth/password-recovery').send({ email: 'invalid-email' }),
        req.post('/auth/password-recovery').send({ email: 234 }),
        req.post('/auth/password-recovery').send({ email: '' }),
        req.post('/auth/password-recovery').send({ email: '    ' }),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages).toHaveLength(1);
        expect(res.body.errorsMessages[0].field).toBe('email');
      }
    });

    // it('should return 429 after 5 password recovery attempts', async () => {
    //   await testHelper.makeRequestsLimit('/auth/password-recovery');

    //   const res = await req.post('/auth/password-recovery').send({});

    //   expect(res.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    // });
  });

  describe('POST /new-password', () => {
    // afterEach(async () => {
    //   await testHelper.clearRedis();
    // });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should successfuly update password', async () => {
      const recoveryCode = tokenService.createRandomCode();

      await testHelper.createUserInDb({
        passwordRecovery: {
          recoveryCode,
          expDate: dateService.addHours(2),
        },
      });

      const newPasswordBody: NewPasswordBody = {
        newPassword: 'newPassword1',
        recoveryCode,
      };

      const res = await req.post('/auth/new-password').send(newPasswordBody);

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return 404 is user is not found', async () => {
      const newPasswordBody = {
        newPassword: 'newPassword1',
        recoveryCode: 'invalidCode',
      };

      const res = await req.post('/auth/new-password').send(newPasswordBody);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body.message).toBe('User was not found');
    });

    it('should return 400 for expired recovery code', async () => {
      const recoveryCode = tokenService.createRandomCode();

      await testHelper.createUserInDb({
        passwordRecovery: {
          recoveryCode,
          expDate: dateService.addHours(-2),
        },
      });

      const newPasswordBody = {
        newPassword: 'newPassword1',
        recoveryCode,
      };

      const res = await req.post('/auth/new-password').send(newPasswordBody);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBe('Recovery code is already expired');
    });

    it('should return 400 for invalid new password body', async () => {
      const invalidBodyMinValues = {
        newPassword: 'a'.repeat(
          createUserInputRestrictions.password.minLength - 1,
        ),
        recoveryCode: '',
      };

      const invalidBodyMaxValues = {
        newPassword: 'a'.repeat(
          createUserInputRestrictions.password.maxLength + 1,
        ),
        recoveryCode: 23,
      };

      const whiteSpacesValues = {
        newPassword: '            ',
        recoveryCode: '          ',
      };

      const invalidFormatValues = {
        newPassword: 12345678,
        recoveryCode: true,
      };

      const resArr = await Promise.all([
        req.post('/auth/new-password').send(invalidBodyMinValues),
        req.post('/auth/new-password').send(invalidBodyMaxValues),
        req.post('/auth/new-password').send(whiteSpacesValues),
        req.post('/auth/new-password').send(invalidFormatValues),
        req.post('/auth/new-password').send({}),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages).toHaveLength(2);
      }
    });

    // it('should return 429 after 5 password updating attempts', async () => {
    //   await testHelper.makeRequestsLimit('/auth/new-password');

    //   const res = await req.post('/auth/new-password').send({});

    //   expect(res.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    // });
  });

  describe('POST /email-resending', () => {
    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    // afterEach(async () => {
    //   await testHelper.clearRedis();
    // });

    it('should return 400 for invalid email format', async () => {
      const resArr = await Promise.all([
        req
          .post('/auth/registration-email-resending')
          .send({ email: 'invalid-email' }),
        req.post('/auth/registration-email-resending').send({ email: 234 }),
        req.post('/auth/registration-email-resending').send({ email: '' }),
        req.post('/auth/registration-email-resending').send({ email: '    ' }),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages).toHaveLength(1);
        expect(res.body.errorsMessages[0].field).toBe('email');
      }
    });

    // it('should return 429 after 5 email resending attempts', async () => {
    //   await testHelper.makeRequestsLimit('/auth/registration-email-resending');

    //   const res = await req.post('/auth/registration-email-resending').send({});

    //   expect(res.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    // });
  });

  describe('POST /email-confirmation', () => {
    beforeAll(async () => {
      await testHelper.createUserInDb({
        emailConfirmation: { confirmationCode: 'code' },
      });
    });

    // afterEach(async () => {
    //   await testHelper.clearRedis();
    // });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should successfuly confirm email', async () => {
      const res = await req
        .post('/auth/registration-confirmation')
        .send({ code: 'code' });

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return 400 if email is already confirmed', async () => {
      const res = await req
        .post('/auth/registration-confirmation')
        .send({ code: 'code' });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBe('Email is already confirmed');
    });

    it('should return 400 for expired confirmation code', async () => {
      await testHelper.createUserInDb({
        emailConfirmation: {
          confirmationCode: 'expiredCode',
          expDate: dateService.addHours(-2),
        },
      });

      const res = await req
        .post('/auth/registration-confirmation')
        .send({ code: 'expiredCode' });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBe('Confirmation code is already expired');
    });

    it('should return 404 for not existing confirmation code', async () => {
      const res = await req
        .post('/auth/registration-confirmation')
        .send({ code: 'invalidCode' });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body.message).toBe('User was not found');
    });

    it('should return 400 for invalid confirmation code', async () => {
      const resArr = await Promise.all([
        req.post('/auth/registration-confirmation').send({ code: '' }),
        req.post('/auth/registration-confirmation').send({ code: '    ' }),
        req.post('/auth/registration-confirmation').send({ code: 234 }),
        req.post('/auth/registration-confirmation').send({}),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages).toHaveLength(1);
        expect(res.body.errorsMessages[0].field).toBe('code');
      }
    });

    // it('should return 429 after 5 email confirmation attempts', async () => {
    //   await testHelper.makeRequestsLimit('/auth/registration-confirmation');

    //   const res = await req.post('/auth/registration-confirmation').send({});

    //   expect(res.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    // });
  });
});
