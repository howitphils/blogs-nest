import { LikeStatuses } from '../../../core/types/like-statuses.types';

export class PostLikeDbDto {
  postId: string;
  userId: string;
  login: string;
  status: LikeStatuses;
  createdAt: string;
}
