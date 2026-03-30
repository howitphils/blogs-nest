import { CommentsQueryRepository } from './../repository/comments-query.repository';
import { Controller, Get, Injectable, Param } from '@nestjs/common';
import { ROUTES } from '../../../core/constants/routes.constants';
import { CommentViewDto } from './view/comment-view.dto';

@Injectable()
@Controller(ROUTES.MAIN.comments)
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}
  @Get(':id')
  async getComment(@Param(':id') id: string): Promise<CommentViewDto> {
    const comment = await this.commentsQueryRepository.getCommentByIdOrFail(id);

    return comment;
  }
}
