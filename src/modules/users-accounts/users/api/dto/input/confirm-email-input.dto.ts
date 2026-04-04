import { IsStringWithTrim } from '../../../../../core/decorators/string-with-trim.decorator';

export class ConfirmEmailInputDto {
  @IsStringWithTrim()
  code: string;
}
