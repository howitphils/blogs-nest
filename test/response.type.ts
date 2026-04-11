import { HttpStatus } from '@nestjs/common';

export type TestResponseType<T> = {
  status: HttpStatus;
  body: T;
};
