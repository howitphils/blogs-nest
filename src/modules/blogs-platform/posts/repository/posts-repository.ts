import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Post } from '../domain/post.entity';

import type { PostDocument, PostModelType } from '../domain/post.entity';
import { CreatePostDomainDto } from '../domain/dto/create-post-domain.dto';
import { DomainException } from '../../../core/exception-filters/exceptions/domain.exception';
import { errorMessages } from '../../../core/constants/error-messages.constants';
import { DomainExceptionCode } from '../../../core/exception-filters/exceptions/domain.exception-code';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async save(post: PostDocument) {
    await post.save();
  }

  async createPost(dto: CreatePostDomainDto): Promise<string> {
    const post = this.PostModel.createInstance(dto);

    await post.save();

    return post.id;
  }

  async getPostByIdOrFail(postId: string): Promise<PostDocument> {
    return this.PostModel.findById(postId).orFail(
      new DomainException(
        errorMessages.POST_NOT_FOUND,
        DomainExceptionCode.NOT_FOUND,
      ),
    );
  }

  async updateBlogNameForPost(blogId: string, blogName: string): Promise<void> {
    await this.PostModel.updateMany({ blogId }, { blogName });
  }
}
