import { BaseQueryParams } from '../../../../../core/dto/base-query-params.dto';

export class UsersQueryParams extends BaseQueryParams {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
}
