import { LikeStatuses } from '../../../../core/types/like-statuses.types';

export class CreatePostLikeDomainDto {
  login: string;
  status: LikeStatuses;
  postId: string;
  userId: string;
}
