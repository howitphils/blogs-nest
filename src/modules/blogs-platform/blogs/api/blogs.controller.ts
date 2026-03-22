import { Controller, Get, Injectable, Param, Query } from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryParams } from './dto/input/query-params.dto';
import { BlogViewDto } from './dto/view/blog-view-model.dto';
import { ROUTES } from '../../../core/constants/routes.constants';
import { RequestWithParamsIdAndQuery } from '../../../core/types/request.types';
import { BaseQueryParams } from '../../../core/dto/base-query-params.dto';

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
  async getAllBlogs(@Query() query: BlogsQueryParams): Promise<BlogViewDto[]> {
    const sortParams = matchedData<BlogsQueryParams>(req);

    const blogs = await this.blogsQueryRepository.getBlogs(sortParams);

    return blogs;
  }

  @Get(':id')
  async getBlogById(@Param(':id') id: string): Promise<BlogViewDto> {
    const blog = await this.blogsQueryRepository.getBlogByIdOrFail(id);

    return blog;
  }

  @Get(':id/posts')
  async getPostsForBlog(
    req: RequestWithParamsIdAndQuery<BaseQueryParams>,
    res: Response<PaginationType<PostViewModel>>,
  ): Promise<Response> {
    const userId = req.user?.userId;
    const blogId = req.params.id;
    const sortParams = matchedData<BaseQueryParams>(req);

    const posts = await this.postsQueryRepository.getPosts(
      sortParams,
      blogId,
      userId,
    );

    return res.status(HttpStatus.OK).json(posts);
  }

  async createPostForBlog(
    req: RequestWithParamsIdAndBody<PostForBlogInputModel>,
    res: Response<PostViewModel>,
  ): Promise<Response> {
    const blogId = req.params.id;
    const { content, shortDescription, title } = req.body;

    const newPostId = await this.postsService.createPost({
      blogId,
      content,
      shortDescription,
      title,
    });

    const newPost =
      await this.postsQueryRepository.getPostByIdOrFail(newPostId);

    return res.status(HttpStatus.CREATED).json(newPost);
  }

  async createBlog(
    req: RequestWithBody<BlogInputModel>,
    res: Response<BlogViewDto>,
  ): Promise<Response> {
    const newBlogId = await this.blogsService.createBlog(req.body);

    const newBlog =
      await this.blogsQueryRepository.getBlogByIdOrFail(newBlogId);

    return res.status(HttpStatus.CREATED).json(newBlog);
  }

  async updateBlog(
    req: RequestWithParamsIdAndBody<BlogInputModel>,
    res: Response,
  ): Promise<Response> {
    const blogId = req.params.id;
    const blogDto: UpdateBlogDtoModel = { ...req.body, blogId };

    await this.blogsService.updateBlog(blogDto);

    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  async deleteBlog(req: RequestWithParamsId, res: Response): Promise<Response> {
    const blogId = req.params.id;

    await this.blogsService.deleteBlog(blogId);

    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
