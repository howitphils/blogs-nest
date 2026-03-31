import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsQueryRepository } from './blogs/repository/blogs-query-repository';
import { PostsQueryRepository } from './posts/repository/posts-query-repository';
import { PostsRepository } from './posts/repository/posts-repository';
import { PostSchema, Post } from './posts/domain/post.entity';
import { PostsService } from './posts/application/posts.service';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import {
  CommentLike,
  CommentLikeSchema,
} from './comments/domain/comment-like.entity';
import { PostsController } from './posts/api/posts.controller';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsQueryRepository } from './comments/repository/comments-query.repository';
import { BlogsRepository } from './blogs/repository/blogs-repository';
import { UsersAccountsModule } from '../users-accounts/user-accounts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
    UsersAccountsModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsQueryRepository,
    BlogsRepository,
    PostsQueryRepository,
    PostsService,
    PostsRepository,
    CommentsQueryRepository,
  ],
})
export class BlogsPlatformModule {}
