import { LikeStatuses } from '../../../../core/types/like-statuses';

export class CreatePostLikeDomainDto {
  login: string;
  status: LikeStatuses;
  postId: string;
  userId: string;
}
