import { BaseQueryParams } from '../../../../../core/dto/base-query-params.dto';

export class BlogsQueryParams extends BaseQueryParams {
  searchNameTerm: string | null;
}
