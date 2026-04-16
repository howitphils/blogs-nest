/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { RedisClientType } from 'redis';
import { beforeAll, afterAll } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { AppModule } from '../src/app.module';
import { TestHelper } from './test.helper';
import { App } from 'supertest/types';
import { setupApp } from '../src/setup/app.setup';
import { ThrottlerStorage } from '@nestjs/throttler';
import { EmailService } from '../src/modules/core/services/email-service/email.service';
import { EmailServiceMock } from './mocks/email-service.mock';

export let app: INestApplication<App>;
export let req: TestAgent;
export let testHelper: TestHelper;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock)
    .compile();

  app = moduleFixture.createNestApplication();

  setupApp(app);

  await app.init();

  const throttlerStorage = app.get(ThrottlerStorage);
  const redisClient = throttlerStorage.client as RedisClientType;

  req = request(app.getHttpServer());
  testHelper = new TestHelper(req, redisClient);
});

afterAll(async () => {
  await app.close();
});
