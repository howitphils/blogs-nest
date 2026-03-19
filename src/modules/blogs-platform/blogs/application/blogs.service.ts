import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async createBlog(dto: BlogInputModel): Promise<string> {
    const newBlog: BlogDbModel = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMemberShip: false,
    };

    return this.blogsRepository.createBlog(newBlog);
  }

  async updateBlog(dto: UpdateBlogDtoModel): Promise<void> {
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
