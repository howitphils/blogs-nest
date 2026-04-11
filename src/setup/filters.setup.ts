import { INestApplication } from '@nestjs/common';
import { AllExceptionsFilter } from '../modules/core/exception-filters/all-exception.filter';
import { DomainExceptionFilter } from '../modules/core/exception-filters/domain-exception.filter';
import { ThrottlerExceptionFilter } from '../modules/core/exception-filters/throttler-exception.filter';

export const setupFilters = (app: INestApplication) => {
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new DomainExceptionFilter(),
    new ThrottlerExceptionFilter(),
  );
};
