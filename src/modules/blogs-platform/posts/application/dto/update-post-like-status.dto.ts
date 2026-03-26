import { LikeStatuses } from '../../../../core/types/like-statuses';

export class UpdatePostLikeStatusDto {
  postId: string;
  userId: string;
  likeStatus: LikeStatuses;
}
