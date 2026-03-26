import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { PostNotFoundError } from '../application/errors/posts-errors';
import { Post } from '../domain/post.entity';

import type { PostDocument, PostModelType } from '../domain/post.entity';
import { CreatePostDomainDto } from '../domain/dto/create-post-domain.dto';

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
    return this.PostModel.findById(postId).orFail(new PostNotFoundError());
  }

  async updateBlogNameForPost(blogId: string, blogName: string): Promise<void> {
    await this.PostModel.updateMany({ blogId }, { blogName });
  }
}
