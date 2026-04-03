import { LikeStatuses } from '../../../../../core/types/like-statuses.types';
import { PostLikeViewDto } from './post-like-view.dto';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatuses;
    newestLikes: PostLikeViewDto[];
  };
}
