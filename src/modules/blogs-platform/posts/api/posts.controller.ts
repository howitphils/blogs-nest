import { CommentsQueryRepository } from './../../comments/repository/comments-query.repository';
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
import { ROUTES } from '../../../core/constants/routes.constants';
import { BaseQueryParams } from '../../../core/dto/base-query-params.dto';
import { PostInputDto } from './dto/input/create-post-input.dto';
import { UpdatePostInputDto } from './dto/input/update-post-input.dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../repository/posts-query-repository';
import { PaginationViewDto } from '../../../core/dto/pagination.dto';
import { PostViewDto } from './dto/view/post-view.dto';
import { CommentViewDto } from '../../comments/api/view/comment-view.dto';
import { BasicAuthGuard } from '../../../core/guards/basic-auth.guard';
import { MongoIdValidationPipe } from '../../../core/pipes/MongoIdValidation.pipe';

@Injectable()
@Controller(ROUTES.MAIN.posts)
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
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
    @Param('id', MongoIdValidationPipe) postId: string,
    @Query() query: BaseQueryParams,
  ): Promise<PaginationViewDto<CommentViewDto>> {
    const comments = await this.commentsQueryRepository.getComments(
      query,
      postId,
    );

    return comments;
  }

  @Get(':id')
  async getPostById(
    @Param('id', MongoIdValidationPipe) id: string,
  ): Promise<PostViewDto> {
    const post = await this.postsQueryRepository.getPostByIdOrFail(id);

    return post;
  }

  @Post()
  @UseGuards(BasicAuthGuard)
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
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id', MongoIdValidationPipe) postId: string,
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
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id', MongoIdValidationPipe) id: string) {
    await this.postsService.deletePost(id);
  }
}
