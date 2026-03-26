import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PostLike, PostLikeSchema } from './post-like-schema';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 150,
  })
  shortDescription: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50,
  })
  blogName: string;

  @Prop({ type: String, required: true, trim: true, minlength: 1 })
  content: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: [PostLikeSchema], required: true, default: [] })
  likes: PostLike[];

  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;
}

export const PostSchema = SchemaFactory.createForClass(Post);
