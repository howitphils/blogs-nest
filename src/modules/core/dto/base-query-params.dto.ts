import { Type } from 'class-transformer';
import { defaultPagination } from '../constants/query-params.constants';

export enum SortDirections {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortByOptions {
  CREATED_AT = 'createdAt',
}

export class BaseQueryParams {
  @Type(() => Number)
  pageNumber: number = defaultPagination.pageNumber;

  @Type(() => Number)
  pageSize: number = defaultPagination.pageSize;

  sortBy: SortByOptions = SortByOptions.CREATED_AT;
  sortDirection: SortDirections = SortDirections.DESC;
}
