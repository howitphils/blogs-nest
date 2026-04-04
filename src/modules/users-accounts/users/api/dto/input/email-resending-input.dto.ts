import { IsEmail } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/string-with-trim.decorator';

export class EmailResendingInputDto {
  @IsStringWithTrim()
  @IsEmail()
  email: string;
}
