import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../repository/blogs-repository';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogDbDto } from '../dto/blog-db.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const newBlog: BlogDbDto = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMemberShip: false,
    };

    return this.blogsRepository.createBlog(newBlog);
  }

  async updateBlog(dto: UpdateBlogDto): Promise<void> {
    const blog = await this.blogsRepository.getBlogByIdOrFail(dto.blogId);

    if (blog.name !== dto.name) {
      await this.postsRepository.updateBlogNameForPost(dto.blogId, dto.name);
    }

    await this.blogsRepository.updateBlog(dto);
  }

  async deleteBlog(blogId: string): Promise<void> {
    await this.blogsRepository.deleteBlog(blogId);
  }
}
