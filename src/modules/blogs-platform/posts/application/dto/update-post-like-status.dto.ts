import { LikeStatuses } from '../../../../core/types/like-statuses.types';

export class UpdatePostLikeStatusDto {
  postId: string;
  userId: string;
  likeStatus: LikeStatuses;
}
