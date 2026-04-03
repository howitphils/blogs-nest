import { LikeStatuses } from '../../../../core/types/like-statuses.types';

class LikeInfoViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatuses;
}

class CommentatorInfoViewModel {
  userId: string;
  userLogin: string;
}

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoViewModel;
  createdAt: Date;
  likesInfo: LikeInfoViewModel;
}
