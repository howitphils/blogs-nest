import { IsStringWithTrim } from '../../../../../core/decorators/string-with-trim.decorator';

export class LoginInputDto {
  @IsStringWithTrim()
  loginOrEmail: string;

  @IsStringWithTrim()
  password: string;
}
