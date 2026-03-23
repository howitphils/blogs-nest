import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './schemas/blog-schema';
import { Model } from 'mongoose';
import { UpdateBlogDto } from '../application/dto/update-blog.dto';
import { BlogDbDto } from '../dto/blog-db.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<Blog>) {}

  async getBlogByIdOrFail(blogId: string): Promise<BlogDocument> {
    return this.BlogModel.findById(blogId).orFail(
      new NotFoundException('Blog was not found'),
    );
  }

  async createBlog(blogDto: BlogDbDto): Promise<string> {
    const blog = await this.BlogModel.insertOne(blogDto);

    return blog.id;
  }

  async updateBlog(dto: UpdateBlogDto): Promise<BlogDocument> {
    return this.BlogModel.findByIdAndUpdate(dto.blogId, {
      description: dto.description,
      name: dto.name,
      websiteUrl: dto.websiteUrl,
    }).orFail(new NotFoundException('Blog was not found'));
  }

  async deleteBlog(blogId: string): Promise<BlogDocument> {
    return this.BlogModel.findByIdAndDelete(blogId).orFail(
      new NotFoundException('Blog was not found'),
    );
  }
}
