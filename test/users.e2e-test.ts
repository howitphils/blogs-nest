/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { HttpStatus } from '@nestjs/common';
import { testHelper, req } from './test.setup';
import { defaultPagination } from '../src/modules/core/constants/query-params.constants';
import { UserInputDto } from '../src/modules/users-accounts/users/api/dto/input/create-user-input.dto';
import { createUserInputRestrictions } from '../src/modules/users-accounts/users/api/dto/input/restrictions/create-user-input.restrictions';

describe('Users API', () => {
  describe('GET /users', () => {
    beforeAll(async () => {
      await testHelper.createUsersInDb(15);
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should return users with default pagination params', async () => {
      const res = await req
        .get('/users')
        .set('Authorization', testHelper.getBasicAuthHeader());

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.page).toBe(defaultPagination.pageNumber);
      expect(res.body.pageSize).toBe(defaultPagination.pageSize);
      expect(res.body.pagesCount).toBe(2);
      expect(res.body.totalCount).toBe(15);
      expect(res.body.items.length).toBe(defaultPagination.pageSize);
    });

    it('should return users with added query params', async () => {
      const res = await req
        .get('/users?pageSize=3&pageNumber=2&sortDirection=asc')
        .set('Authorization', testHelper.getBasicAuthHeader());

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.pagesCount).toBe(5);
      expect(res.body.page).toBe(2);
      expect(res.body.items.length).toBe(3);
      expect(res.body.items[0]).toEqual({
        id: expect.any(String),
        login: 'user4',
        email: expect.any(String),
        createdAt: expect.any(String),
      });
    });

    it('should return users with added searchLoginTerm and searchEmailTerm', async () => {
      const res = await req
        .get('/users?searchLoginTerm=Er15&searchEmailTerm=aIL12')
        .set('Authorization', testHelper.getBasicAuthHeader());

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.pagesCount).toBe(1);
      expect(res.body.page).toBe(1);
      expect(res.body.items.length).toBe(2);
      expect(res.body.items[0]).toEqual({
        id: expect.any(String),
        login: 'user15',
        email: 'email15@gmail.com',
        createdAt: expect.any(String),
      });
      expect(res.body.items[1]).toEqual({
        id: expect.any(String),
        login: 'user12',
        email: 'email12@gmail.com',
        createdAt: expect.any(String),
      });
    });

    it('should return users with added searchLoginTerm', async () => {
      const res = await req
        .get('/users?searchLoginTerm=sER15')
        .set('Authorization', testHelper.getBasicAuthHeader());

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.pagesCount).toBe(1);
      expect(res.body.page).toBe(1);
      expect(res.body.items.length).toBe(1);
      expect(res.body.items[0]).toEqual({
        id: expect.any(String),
        login: 'user15',
        email: 'email15@gmail.com',
        createdAt: expect.any(String),
      });
    });

    it('should return users with added searchEmailTerm', async () => {
      const res = await req
        .get('/users?searchEmailTerm=AiL13')
        .set('Authorization', testHelper.getBasicAuthHeader());

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.pagesCount).toBe(1);
      expect(res.body.page).toBe(1);
      expect(res.body.items.length).toBe(1);
      expect(res.body.items[0]).toEqual({
        id: expect.any(String),
        login: 'user13',
        email: 'email13@gmail.com',
        createdAt: expect.any(String),
      });
    });

    it('should return 401 when unauthorized', async () => {
      const res = await req.get('/users');

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('DELETE /users/:id', () => {
    let userId: string;

    beforeAll(async () => {
      userId = await testHelper.createUserInDb();
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should delete a user by Id', async () => {
      await req
        .delete(`/users/${userId}`)
        .set('Authorization', testHelper.getBasicAuthHeader())
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 404 when deleting non-existing user', async () => {
      const res = await req
        .delete(`/users/${userId}`)
        .set('Authorization', testHelper.getBasicAuthHeader());

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 401 when unauthorized', async () => {
      const res = await req
        .delete(`/users/${userId}`)
        .set('Authorization', 'InvalidToken');

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid id type', async () => {
      const res = await req
        .delete('/users/23')
        .set('Authorization', testHelper.getBasicAuthHeader());

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('errorsMessages');
      expect(res.body.errorsMessages.length).toBe(1);
      expect(res.body.errorsMessages[0].field).toBe('id');
    });
  });

  describe('POST /users', () => {
    let userInputDto: UserInputDto;

    beforeAll(() => {
      userInputDto = testHelper.createUserInputDto();
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should create a new user', async () => {
      const res = await req
        .post('/users')
        .set('Authorization', testHelper.getBasicAuthHeader())
        .send(userInputDto);

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body).toEqual({
        id: expect.any(String),
        email: userInputDto.email,
        login: userInputDto.login,
        createdAt: expect.any(String),
      });
    });

    it('should return 400 for invalid user data', async () => {
      const invalidUserMinValues: UserInputDto = {
        login: 'a'.repeat(createUserInputRestrictions.login.minLength - 1),
        email: '',
        password: 'a'.repeat(
          createUserInputRestrictions.password.minLength - 1,
        ),
      };

      const invalidUserMaxValues: UserInputDto = {
        login: 'a'.repeat(createUserInputRestrictions.login.maxLength + 1),
        email: '    ',
        password: 'a'.repeat(
          createUserInputRestrictions.password.maxLength + 1,
        ),
      };

      const invalidFormatValues = {
        login: 234,
        email: 'email',
        password: 1234567,
      };

      const resArr = await Promise.all([
        testHelper.makePostRequest('/users', invalidUserMinValues),
        testHelper.makePostRequest('/users', invalidUserMaxValues),
        testHelper.makePostRequest('/users', invalidFormatValues),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages.length).toBe(3);
      }
    });

    it('should return 401 when unauthorized', async () => {
      await req
        .post('/users')
        .set('Authorization', 'invalid token')
        .send(userInputDto)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 for not unique user', async () => {
      const sameLoginDto: UserInputDto = {
        login: userInputDto.login,
        email: 'different@gmail.com',
        password: 'a'.repeat(createUserInputRestrictions.password.minLength),
      };

      const sameEmailDto: UserInputDto = {
        login: 'newlogin',
        email: userInputDto.email,
        password: 'a'.repeat(createUserInputRestrictions.password.minLength),
      };

      const resArr = await Promise.all([
        testHelper.makePostRequest('/users', sameLoginDto),
        testHelper.makePostRequest('/users', sameEmailDto),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages.length).toBe(1);
      }

      expect(resArr[0].body.errorsMessages[0].field).toBe('login');
      expect(resArr[1].body.errorsMessages[0].field).toBe('email');
    });
  });
});
