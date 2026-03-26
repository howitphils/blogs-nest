import { LikeStatuses } from '../../../core/types/like-statuses';

export class PostLikeDbDto {
  postId: string;
  userId: string;
  login: string;
  status: LikeStatuses;
  createdAt: string;
}
