import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatuses } from '../../../core/types/like-statuses';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class CommentLike {
  @Prop({
    type: String,
    required: true,
  })
  commentId: string;

  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    enum: Object.values(LikeStatuses),
    required: true,
    default: LikeStatuses.NONE,
  })
  status: LikeStatuses;

  createdAt: Date;
  updatedAt: Date;
}

export type CommentLikeDocument = HydratedDocument<CommentLike>;

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

CommentLikeSchema.loadClass(CommentLike);

export type CommentLikeModelType = Model<CommentLikeDocument> &
  typeof CommentLike;
