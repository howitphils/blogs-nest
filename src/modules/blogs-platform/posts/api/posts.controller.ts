import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ROUTES } from '../../../core/constants/routes.constants';
import { BaseQueryParams } from '../../../core/dto/base-query-params.dto';
import { PostInputDto } from './dto/input/create-post-input.dto';
import { UpdatePostInputDto } from './dto/input/update-post-input.dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../repository/posts-query-repository';
import { PaginationViewDto } from '../../../core/dto/pagination.dto';
import { PostViewDto } from './dto/view/post-view.dto';

@Injectable()
@Controller(ROUTES.MAIN.posts)
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @Get()
  async getPosts(
    @Query() query: BaseQueryParams,
  ): Promise<PaginationViewDto<PostViewDto>> {
    const posts = await this.postsQueryRepository.getPosts(query);

    return posts;
  }

  @Get(':id/comments')
  async getPostsComments(
    @Param('id') id: string,
    @Query() query: BaseQueryParams,
  ) {}

  @Get(':id')
  async getPostById(@Param('id') id: string): Promise<PostViewDto> {
    const post = await this.postsQueryRepository.getPostByIdOrFail(id);

    return post;
  }

  @Post()
  async createPost(@Body() body: PostInputDto): Promise<PostViewDto> {
    const { blogId, content, shortDescription, title } = body;
    const postId = await this.postsService.createPost({
      blogId,
      content,
      shortDescription,
      title,
    });

    const post = this.postsQueryRepository.getPostByIdOrFail(postId);

    return post;
  }

  @Put(':id')
  async updatePost(
    @Param(':id') postId: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    const { blogId, content, shortDescription, title } = body;

    await this.postsService.updatePost({
      blogId,
      content,
      postId,
      shortDescription,
      title,
    });
  }

  @Delete(':id')
  async deletePost(@Param(':id') id: string) {
    await this.postsService.deletePost(id);
  }
}
