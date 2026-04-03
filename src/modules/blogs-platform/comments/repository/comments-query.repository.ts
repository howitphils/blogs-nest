import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../../posts/repository/posts-repository';
import { BaseQueryParams } from '../../../core/dto/base-query-params.dto';
import { PaginationViewDto } from '../../../core/dto/pagination.dto';
import { CommentViewDto } from '../api/view/comment-view.dto';
import {
  LikeStatuses,
  UsersLikeStatuses,
} from '../../../core/types/like-statuses.types';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from '../domain/comment.entity';

import type {
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import { calculateSkip } from '../../../core/utils/calculate-skip';
import { CommentLike } from '../domain/comment-like.entity';

import type { CommentLikeModelType } from '../domain/comment-like.entity';
import { DomainException } from '../../../core/exception-filters/exceptions/domain.exception';
import { ErrorMessages } from '../../../core/constants/error-messages.constants';
import { DomainExceptionCode } from '../../../core/exception-filters/exceptions/domain.exception-code';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
    private postsRepository: PostsRepository,
  ) {}

  //TODO: optional jwt auth guard
  async getComments(
    params: BaseQueryParams,
    postId: string,
    userId?: string,
  ): Promise<PaginationViewDto<CommentViewDto>> {
    await this.postsRepository.getPostByIdOrFail(postId);

    const { pageNumber, pageSize, sortBy, sortDirection } = params;

    const filter = { postId };

    const comments = await this.CommentModel.find(filter)
      .skip(calculateSkip(pageNumber, pageSize))
      .limit(pageSize)
      .sort({ [sortBy]: sortDirection });

    const totalCount = await this.CommentModel.countDocuments(filter);

    let usersLikeStatuses: UsersLikeStatuses = {};

    if (userId) {
      const usersLikes = await this.CommentLikeModel.find({ userId });

      usersLikeStatuses = usersLikes.reduce((acc: UsersLikeStatuses, like) => {
        acc[like.commentId] = like.status;

        return acc;
      }, {});
    }

    const mapedComments = comments.map((comment) =>
      this.mapFromDbToView(
        comment,
        usersLikeStatuses[comment.id] || LikeStatuses.NONE,
      ),
    );

    return PaginationViewDto.mapToView({
      items: mapedComments,
      page: pageNumber,
      pageSize,
      totalCount,
    });
  }

  async getCommentByIdOrFail(
    id: string,
    userId?: string,
  ): Promise<CommentViewDto> {
    const dbComment = await this.CommentModel.findById(id).orFail(
      new DomainException(
        ErrorMessages.COMMENT_NOT_FOUND,
        DomainExceptionCode.NOT_FOUND,
      ),
    );

    let usersLikeStatus = LikeStatuses.NONE;

    if (userId) {
      const like = await this.CommentLikeModel.findOne({
        commentId: id,
        userId,
      });

      if (like) {
        usersLikeStatus = like.status;
      }
    }

    return this.mapFromDbToView(dbComment, usersLikeStatus);
  }

  private mapFromDbToView(
    comment: CommentDocument,
    usersLikeStatus: LikeStatuses,
  ): CommentViewDto {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: { userId: comment.userId, userLogin: comment.userLogin },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesCount,
        dislikesCount: comment.dislikesCount,
        myStatus: usersLikeStatus,
      },
    };
  }
}
