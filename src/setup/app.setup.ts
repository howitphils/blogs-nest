import { setupFilters } from './filters.setup';
import { INestApplication } from '@nestjs/common';
import { setupPipes } from './pipes.setup';

export const setupApp = (app: INestApplication) => {
  setupPipes(app);
  setupFilters(app);
};
