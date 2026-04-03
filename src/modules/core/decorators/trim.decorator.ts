import { Transform } from 'class-transformer';

export const Trim = () => {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
  });
};
