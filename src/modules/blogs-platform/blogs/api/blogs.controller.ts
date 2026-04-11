import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryParams } from './dto/input/blogs-query-params.dto';
import { BlogViewDto } from './dto/view/blog-view-model.dto';
import { ROUTES } from '../../../core/constants/routes.constants';
import { BaseQueryParams } from '../../../core/dto/base-query-params.dto';
import { PaginationViewDto } from '../../../core/dto/pagination.dto';
import { PostViewDto } from '../../posts/api/dto/view/post-view.dto';
import { PostForBlogInputDto } from '../../posts/api/dto/input/create-posts-for-blog-input.dto';
import { BlogInputDto } from './dto/input/create-blog-input.dto';
import { BlogsQueryRepository } from '../repository/blogs-query-repository';
import { PostsQueryRepository } from '../../posts/repository/posts-query-repository';
import { PostsService } from '../../posts/application/posts.service';
import { MongoIdValidationPipe } from '../../../core/pipes/MongoIdValidation.pipe';
import { BasicAuthGuard } from '../../../core/guards/basic-auth.guard';

@Injectable()
@Controller(ROUTES.MAIN.blogs)
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private postsService: PostsService,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: BlogsQueryParams,
  ): Promise<PaginationViewDto<BlogViewDto>> {
    const blogs = await this.blogsQueryRepository.getBlogs(query);

    return blogs;
  }

  @Get(':id')
  async getBlogById(
    @Param('id', MongoIdValidationPipe) id: string,
  ): Promise<BlogViewDto> {
    const blog = await this.blogsQueryRepository.getBlogByIdOrFail(id);

    return blog;
  }

  @Get(':id/posts')
  async getPostsForBlog(
    @Param(':id') blogId: string,
    @Query() query: BaseQueryParams,
  ): Promise<PaginationViewDto<PostViewDto>> {
    const posts = await this.postsQueryRepository.getPosts(query, blogId);

    return posts;
  }

  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param(':id') blogId: string,
    @Body() body: PostForBlogInputDto,
  ): Promise<PostViewDto> {
    const { content, shortDescription, title } = body;

    const newPostId = await this.postsService.createPost({
      blogId,
      content,
      shortDescription,
      title,
    });

    const newPost =
      await this.postsQueryRepository.getPostByIdOrFail(newPostId);

    return newPost;
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() body: BlogInputDto): Promise<BlogViewDto> {
    const newBlogId = await this.blogsService.createBlog(body);

    const newBlog =
      await this.blogsQueryRepository.getBlogByIdOrFail(newBlogId);

    return newBlog;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updateBlog(
    @Param(':id') id: string,
    @Body() body: BlogInputDto,
  ): Promise<void> {
    await this.blogsService.updateBlog({
      name: body.name,
      blogId: id,
      description: body.description,
      websiteUrl: body.websiteUrl,
    });

    return;
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.blogsService.deleteBlog(id);

    return;
  }
}
