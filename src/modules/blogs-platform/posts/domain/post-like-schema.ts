import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatuses } from '../../../core/types/like-statuses.types';
import { CreatePostLikeDomainDto } from './dto/create-post-like-domain.dto';

@Schema()
export class PostLike {
  @Prop({ type: String, required: true })
  postId: string;

  @Prop({
    type: String,
    enum: Object.values(LikeStatuses),
    required: true,
    default: LikeStatuses.NONE,
  })
  status: LikeStatuses;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  static create(dto: CreatePostLikeDomainDto): PostLike {
    const newLike = new PostLike();

    newLike.login = dto.login;
    newLike.postId = dto.postId;
    newLike.status = dto.status;
    newLike.userId = dto.userId;
    newLike.createdAt = new Date().toISOString();

    return newLike;
  }

  updateStatus(newStatus: LikeStatuses) {
    this.status = newStatus;
  }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
