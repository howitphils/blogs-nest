import { Length } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/string-with-trim.decorator';
import { createUserInputRestrictions } from './restrictions/create-user-input.restrictions';

export class UpdatePasswordInputDto {
  @IsStringWithTrim()
  @Length(
    createUserInputRestrictions.password.minLength,
    createUserInputRestrictions.password.maxLength,
  )
  newPassword: string;

  @IsStringWithTrim()
  recoveryCode: string;
}
