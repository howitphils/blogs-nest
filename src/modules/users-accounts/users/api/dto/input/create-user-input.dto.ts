import { IsEmail, Length } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/string-with-trim.decorator';
import { createUserInputRestrictions } from './restrictions/create-user-input.restrictions';

export class UserInputDto {
  @IsStringWithTrim()
  @Length(
    createUserInputRestrictions.login.minLength,
    createUserInputRestrictions.login.maxLength,
  )
  login: string;

  @IsStringWithTrim()
  @Length(
    createUserInputRestrictions.password.minLength,
    createUserInputRestrictions.password.maxLength,
  )
  password: string;

  @IsStringWithTrim()
  @IsEmail()
  email: string;
}
