import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsQueryParams } from '../api/dto/input/query-params.dto';
import { PaginationViewDto } from '../../../core/dto/pagination.dto';
import { BlogViewDto } from '../api/dto/view/blog-view-model.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './schemas/blog-schema';
import { Model } from 'mongoose';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<Blog>) {}

  async getBlogs(
    params: BlogsQueryParams,
  ): Promise<PaginationViewDto<BlogViewDto>> {
    const { pageNumber, pageSize, searchNameTerm, sortBy, sortDirection } =
      params;

    const skip = (pageNumber - 1) * pageSize;

    const filter = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: 'i' } }
      : {};

    const blogs = await this.BlogModel.find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const totalCount = await this.BlogModel.countDocuments(filter);
    const mappedBlogs = blogs.map((blog) => this.mapFromDbToView(blog));

    return PaginationViewDto.mapToView({
      totalCount,
      page: pageNumber,
      size: pageSize,
      items: mappedBlogs,
    });
  }

  async getBlogByIdOrFail(id: string): Promise<BlogViewDto> {
    const dbBlog = await this.BlogModel.findById(id).orFail(
      new NotFoundException('Blog was not found'),
    );

    return this.mapFromDbToView(dbBlog);
  }

  private mapFromDbToView(blog: BlogDocument): BlogViewDto {
    return {
      id: blog.id,
      description: blog.description,
      name: blog.name,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMemberShip: blog.isMemberShip,
    };
  }
}
