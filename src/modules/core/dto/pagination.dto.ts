export class PaginationViewDto<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];

  public static mapToView<T>(data: {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
  }): PaginationViewDto<T> {
    return {
      page: data.page,
      pageSize: data.pageSize,
      pagesCount: Math.ceil(data.totalCount / data.pageSize),
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}
