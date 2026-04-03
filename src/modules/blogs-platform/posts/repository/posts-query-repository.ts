import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../../blogs/repository/blogs-query-repository';
import { BaseQueryParams } from '../../../core/dto/base-query-params.dto';
import { PaginationViewDto } from '../../../core/dto/pagination.dto';
import { PostViewDto } from '../api/dto/view/post-view.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  LikeStatuses,
  UsersLikeStatuses,
} from '../../../core/types/like-statuses.types';
import { PostLikeDbDto } from '../dto/post-like-db.dto';
import {
  Post,
  type PostDocument,
  type PostModelType,
} from '../domain/post.entity';
import { PostLikeViewDto } from '../api/dto/view/post-like-view.dto';
import { DomainException } from '../../../core/exception-filters/exceptions/domain.exception';
import { ErrorMessages } from '../../../core/constants/error-messages.constants';
import { DomainExceptionCode } from '../../../core/exception-filters/exceptions/domain.exception-code';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async getPosts(
    params: BaseQueryParams,
    blogId?: string,
    userId?: string,
  ): Promise<PaginationViewDto<PostViewDto>> {
    const { pageNumber, pageSize, sortBy, sortDirection } = params;

    let filter = {};

    if (blogId) {
      await this.blogsQueryRepository.getBlogByIdOrFail(blogId);

      filter = { blogId };
    }

    const skip = (pageNumber - 1) * pageSize;

    const posts = await this.PostModel.find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const totalCount = await this.PostModel.countDocuments(filter);

    let userLikeStatuses: UsersLikeStatuses = {};

    if (userId) {
      userLikeStatuses = posts.reduce((acc: UsersLikeStatuses, post) => {
        const userLike = post.likes.find((like) => like.userId === userId);

        if (userLike) {
          acc[post.id] = userLike.status;
          return acc;
        }

        return acc;
      }, {});
    }

    return {
      page: pageNumber,
      pagesCount: Math.ceil(totalCount / pageSize),
      pageSize,
      totalCount,
      items: posts.map((post) =>
        this.mapFromDbToView(
          post,
          userLikeStatuses[post.id] || LikeStatuses.NONE,
        ),
      ),
    };
  }

  async getPostByIdOrFail(id: string, userId?: string): Promise<PostViewDto> {
    const dbPost = await this.PostModel.findById(id).orFail(
      new DomainException(
        ErrorMessages.POST_NOT_FOUND,
        DomainExceptionCode.NOT_FOUND,
      ),
    );

    let userLikeStatus: LikeStatuses = LikeStatuses.NONE;

    if (userId) {
      const userLike = dbPost.likes.find((like) => like.userId === userId);

      if (userLike) {
        userLikeStatus = userLike.status;
      }
    }

    return this.mapFromDbToView(dbPost, userLikeStatus);
  }

  private mapFromDbToView(
    post: PostDocument,
    userLikeStatus: LikeStatuses,
  ): PostViewDto {
    return {
      id: post._id.toString(),
      blogId: post.blogId,
      blogName: post.blogName,
      shortDescription: post.shortDescription,
      content: post.content,
      title: post.title,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: userLikeStatus,
        newestLikes: this.getNewestLikes(post.likes),
      },
    };
  }

  private getNewestLikes(likes: PostLikeDbDto[]): PostLikeViewDto[] {
    return likes
      .filter((like) => like.status === LikeStatuses.LIKE)
      .sort((a, b) => {
        if (b.createdAt > a.createdAt) {
          return 1;
        }
        if (b.createdAt < a.createdAt) {
          return -1;
        }

        return 0;
      })
      .slice(0, 3)
      .map((like) => {
        return {
          addedAt: like.createdAt,
          login: like.login,
          userId: like.userId,
        };
      });
  }
}
