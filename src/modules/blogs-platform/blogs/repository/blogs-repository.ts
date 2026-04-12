import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { UpdateBlogDto } from '../application/dto/update-blog.dto';
import { CreateBlogDto } from '../application/dto/create-blog.dto';

import type { BlogModelType } from '../domain/blog.entity';
import { DomainException } from '../../../core/exception-filters/exceptions/domain.exception';
import { errorMessages } from '../../../core/constants/error-messages.constants';
import { DomainExceptionCode } from '../../../core/exception-filters/exceptions/domain.exception-code';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async save(blog: BlogDocument) {
    await blog.save();
  }

  async getBlogByIdOrFail(blogId: string): Promise<BlogDocument> {
    return this.BlogModel.findById(blogId).orFail(
      new DomainException(
        errorMessages.BLOG_NOT_FOUND,
        DomainExceptionCode.NOT_FOUND,
      ),
    );
  }

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const { description, name, websiteUrl } = dto;

    const blog = this.BlogModel.createInstance({
      description,
      name,
      websiteUrl,
    });

    await blog.save();

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
