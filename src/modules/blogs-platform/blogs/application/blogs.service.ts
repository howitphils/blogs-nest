import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../repository/blogs-repository';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PostsRepository } from '../../posts/repository/posts-repository';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const { description, name, websiteUrl } = dto;

    const blogId = await this.blogsRepository.createBlog({
      description,
      name,
      websiteUrl,
    });

    return blogId;
  }

  async updateBlog(dto: UpdateBlogDto): Promise<void> {
    const { blogId, description, name, websiteUrl } = dto;

    const blog = await this.blogsRepository.getBlogByIdOrFail(blogId);

    if (blog.name !== dto.name) {
      await this.postsRepository.updateBlogNameForPost(dto.blogId, dto.name);
    }

    blog.update({ description, name, websiteUrl });

    await this.blogsRepository.save(blog);
  }

  async deleteBlog(blogId: string): Promise<void> {
    const blog = await this.blogsRepository.getBlogByIdOrFail(blogId);

    blog.delete();

    await this.blogsRepository.save(blog);
  }
}
