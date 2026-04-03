import { IsOptional } from 'class-validator';
import { BaseQueryParams } from '../../../../../core/dto/base-query-params.dto';
import { IsStringWithTrim } from '../../../../../core/decorators/string-with-trim.decorator';

export class BlogsQueryParams extends BaseQueryParams {
  @IsStringWithTrim()
  @IsOptional()
  searchNameTerm: string | null;
}
