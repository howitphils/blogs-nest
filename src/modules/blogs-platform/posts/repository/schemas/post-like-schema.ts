import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatuses } from '../../../../core/types/like-statuses';

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
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
