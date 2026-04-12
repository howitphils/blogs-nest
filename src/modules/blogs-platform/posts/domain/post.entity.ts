import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { PostLike, PostLikeSchema } from './post-like-schema';
import { CreatePostDomainDto } from './dto/create-post-domain.dto';
import { UpdatePostDomainDto } from './dto/update-post-domain.dto';
import { LikeStatuses } from '../../../core/types/like-statuses.types';
import { CreatePostLikeDomainDto } from './dto/create-post-like-domain.dto';
import { DomainException } from '../../../core/exception-filters/exceptions/domain.exception';
import { errorMessages } from '../../../core/constants/error-messages.constants';
import { DomainExceptionCode } from '../../../core/exception-filters/exceptions/domain.exception-code';

@Schema({ timestamps: true })
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

  @Prop({ type: Date, nullable: true, default: null })
  deletedAt: Date | null;

  @Prop({ type: String, required: true })
  blogId: string;

  @Prop({ type: [PostLikeSchema], required: true, default: [] })
  likes: PostLike[];

  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;

  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;

  createdAt: string;
  updatedAt: string;

  static createInstance(dto: CreatePostDomainDto): PostDocument {
    const post = new this();

    post.blogId = dto.blogId;
    post.blogName = dto.blogName;
    post.title = dto.title;
    post.content = dto.content;
    post.shortDescription = dto.shortDescription;

    return post as PostDocument;
  }

  update(dto: UpdatePostDomainDto) {
    const { blogId, content, shortDescription, title } = dto;

    this.blogId = blogId;
    this.content = content;
    this.shortDescription = shortDescription;
    this.title = title;
  }

  delete() {
    if (this.deletedAt !== null) {
      throw new DomainException(
        errorMessages.POST_DELETED,
        DomainExceptionCode.NOT_FOUND,
      );
    }
    this.deletedAt = new Date();
  }

  addLike(dto: CreatePostLikeDomainDto) {
    const { status, login, postId, userId } = dto;

    const newLike = PostLike.create({
      login,
      status,
      postId,
      userId,
    });

    this.likes.unshift(newLike);

    if (newLike.status === LikeStatuses.LIKE) {
      this.likesCount += 1;
    } else if (newLike.status === LikeStatuses.DISLIKE) {
      this.dislikesCount += 1;
    }
  }

  updateLikesCount(newCount: number) {
    this.likesCount = newCount;
  }

  updateDislikesCount(newCount: number) {
    this.dislikesCount = newCount;
  }
}

export type PostDocument = HydratedDocument<Post>;

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostModelType = Model<PostDocument> & typeof Post;
