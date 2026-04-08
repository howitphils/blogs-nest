import { User, UserSchema } from './../users-accounts/users/domain/user.entity';
import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../blogs-platform/blogs/domain/blog.entity';
import {
  CommentLike,
  CommentLikeSchema,
} from '../blogs-platform/comments/domain/comment-like.entity';
import {
  Comment,
  CommentSchema,
} from '../blogs-platform/comments/domain/comment.entity';
import { PostSchema, Post } from '../blogs-platform/posts/domain/post.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
  ],
  controllers: [TestingController],
})
export class TestingModule {}
