export enum LikeStatuses {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export class UsersLikeStatuses {
  [key: string]: LikeStatuses; // key = id(post/comment) / value = like status
}
