import { Type } from 'class-transformer';
import { defaultQueryParams } from '../constants/query-params.constants';

export enum SortDirections {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortByOptions {
  CREATED_AT = 'createdAt',
}

export class BaseQueryParams {
  @Type(() => Number)
  pageNumber: number = defaultQueryParams.pageNumber;

  @Type(() => Number)
  pageSize: number = defaultQueryParams.pageSize;

  sortBy: SortByOptions = SortByOptions.CREATED_AT;
  sortDirection: SortDirections = SortDirections.DESC;
}
