export const createBlogInputRestrictions = {
  name: {
    maxLength: 15,
    minLength: 3,
  },
  description: {
    maxLength: 500,
    minLength: 10,
  },
  websiteUrl: {
    maxLength: 100,
  },
};
