import { safeRegex } from '../../../../core/utils/safe-regex';

export const createUserFilter = (
  searchLoginTerm: string | null,
  searchEmailTerm: string | null,
) => {
  let filter = {};

  if (searchLoginTerm && searchEmailTerm) {
    filter = {
      $or: [
        {
          'accountData.login': {
            $regex: `${safeRegex(searchLoginTerm)}`,
            $options: 'i',
          },
        },
        {
          'accountData.email': {
            $regex: `${safeRegex(searchEmailTerm)}`,
            $options: 'i',
          },
        },
      ],
    };
  } else if (searchLoginTerm) {
    filter = {
      'accountData.login': {
        $regex: `${safeRegex(searchLoginTerm)}`,
        $options: 'i',
      },
    };
  } else if (searchEmailTerm) {
    filter = {
      'accountData.email': {
        $regex: `${safeRegex(searchEmailTerm)}`,
        $options: 'i',
      },
    };
  }

  return filter;
};
