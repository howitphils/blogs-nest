import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 300,
  })
  content: string;

  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: true,
  })
  postId: string;

  @Prop({
    type: String,
    required: true,
    minlength: 1,
  })
  userLogin: string;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, required: true, nullable: true, default: null })
  deletedAt: Date | null;

  @Prop({
    type: Number,
    required: true,
    min: 0,
    default: 0,
  })
  likesCount: number;

  @Prop({
    type: Number,
    required: true,
    min: 0,
    default: 0,
  })
  dislikesCount: number;
}

export type CommentDocument = HydratedDocument<Comment>;

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentModelType = Model<CommentDocument> & typeof Comment;
