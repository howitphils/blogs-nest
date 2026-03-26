import { Module, Post } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/repository/schemas/blog-schema';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsQueryRepository } from './blogs/repository/blogs-query-repository';
import { PostSchema } from './posts/repository/schemas/post-schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
    ]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsQueryRepository],
})
export class BlogsPlatformModule {}
