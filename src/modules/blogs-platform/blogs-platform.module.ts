import { Module, Post } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsQueryRepository } from './blogs/repository/blogs-query-repository';
import { PostSchema } from './posts/repository/schemas/post-schema';
import { PostsQueryRepository } from './posts/repository/posts-query-repository';
import { PostsService } from './comments/application/posts-service';
import { PostsRepository } from './posts/repository/posts-repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [BlogsController],
  providers: [
    BlogsService,
    BlogsQueryRepository,
    PostsQueryRepository,
    PostsService,
    PostsRepository,
  ],
})
export class BlogsPlatformModule {}
