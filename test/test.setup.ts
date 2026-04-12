import { beforeAll, afterAll } from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { AppModule } from '../src/app.module';
import { TestHelper } from './test.helper';
import { App } from 'supertest/types';
import { setupApp } from '../src/setup/app.setup';

export let app: INestApplication<App>;
export let req: TestAgent;
export let testHelper: TestHelper;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();

  setupApp(app);

  req = request(app.getHttpServer());
  testHelper = new TestHelper(req);

  await app.init();
});

afterAll(async () => {
  await app.close();
});
