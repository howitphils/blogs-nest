import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './modules/core/exception-filters/all-exception.filter';
import { DomainExceptionFilter } from './modules/core/exception-filters/domain-exception.filter';
import { DomainValidationException } from './modules/core/exception-filters/exceptions/domain-validation.exception';
import { formatErrors } from './modules/core/utils/format-errors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        throw new DomainValidationException(formatErrors(errors));
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(), new DomainExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((e) => {
  console.log('App booting failed', e);
});
