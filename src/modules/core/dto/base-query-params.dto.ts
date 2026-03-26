import { Type } from 'class-transformer/types/decorators';

export enum SortDirections {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortByOptions {
  CREATED_AT = 'createdAt',
}

export class BaseQueryParams {
  @Type(() => Number)
  pageNumber: number = 1;

  @Type(() => Number)
  pageSize: number = 10;

  sortBy: SortByOptions = SortByOptions.CREATED_AT;
  sortDirection: SortDirections = SortDirections.DESC;
}
