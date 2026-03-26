export enum LikeStatuses {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export type UsersLikeStatuses = {
  [key: string]: LikeStatuses;
};
