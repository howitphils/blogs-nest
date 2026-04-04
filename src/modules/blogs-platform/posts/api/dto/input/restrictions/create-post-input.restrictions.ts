export const createPostInputRestrictions = {
  title: {
    minLength: 2,
    maxLength: 30,
  },
  shortDescription: {
    minLength: 3,
    maxLength: 100,
  },
  content: {
    maxLength: 1000,
  },
};
