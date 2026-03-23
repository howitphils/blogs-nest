export const calculatePagesCount = (totalCount: number, pageSize: number) =>
  Math.ceil(totalCount / pageSize);
