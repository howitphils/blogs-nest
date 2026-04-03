import { applyDecorators } from '@nestjs/common';
import { Trim } from './trim.decorator';
import { IsNotEmpty, IsString } from 'class-validator';

export const IsStringWithTrim = () => {
  return applyDecorators(IsString(), Trim(), IsNotEmpty());
};
