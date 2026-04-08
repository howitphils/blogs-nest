import { InjectModel } from '@nestjs/mongoose';
import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ROUTES } from '../core/constants/routes.constants';
import { User } from '../users-accounts/users/domain/user.entity';

import { Comment } from '../blogs-platform/comments/domain/comment.entity';
import { Blog } from '../blogs-platform/blogs/domain/blog.entity';
import { Post } from '../blogs-platform/posts/domain/post.entity';
import { CommentLike } from '../blogs-platform/comments/domain/comment-like.entity';

import type { UserModelType } from './../users-accounts/users/domain/user.entity';
import type { CommentModelType } from '../blogs-platform/comments/domain/comment.entity';
import type { BlogModelType } from '../blogs-platform/blogs/domain/blog.entity';
import type { PostModelType } from '../blogs-platform/posts/domain/post.entity';
import type { CommentLikeModelType } from '../blogs-platform/comments/domain/comment-like.entity';

@Injectable()
@Controller(ROUTES.MAIN.testing)
export class TestingController {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}

  @Delete(ROUTES.SUB.allData)
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearDb() {
    await Promise.all([
      this.UserModel.deleteMany({}),
      this.CommentModel.deleteMany({}),
      this.PostModel.deleteMany({}),
      this.CommentLikeModel.deleteMany({}),
      this.BlogModel.deleteMany({}),
    ]);
  }
}
