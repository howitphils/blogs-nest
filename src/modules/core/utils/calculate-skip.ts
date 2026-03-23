export const calculateSkip = (pageNumber: number, pageSize: number) =>
  (pageNumber - 1) * pageSize;
