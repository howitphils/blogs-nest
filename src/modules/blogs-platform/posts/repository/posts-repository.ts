import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { PostNotFoundError } from '../application/errors/posts-errors';
import { LikeStatuses } from '../../../core/types/like-statuses';
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

  // async deletePost(postId: string): Promise<PostDocument> {
  //   return this.PostModel.findByIdAndDelete(postId).orFail(
  //     new PostNotFoundError(),
  //   );
  // }

  async updateBlogNameForPost(blogId: string, blogName: string): Promise<void> {
    await this.PostModel.updateMany({ blogId }, { blogName });
  }

  // async addPostLike(
  //   id: string,
  //   like: PostLikeDbDto,
  //   likesCount: number,
  //   dislikesCount: number,
  // ): Promise<PostDocument> {
  //   return this.PostModel.findByIdAndUpdate(id, {
  //     $push: {
  //       likes: like,
  //     },
  //     $set: {
  //       likesCount,
  //       dislikesCount,
  //     },
  //   }).orFail(new PostNotFoundError());
  // }

  async updatePostLikeStatus(
    postId: string,
    userId: string,
    newStatus: LikeStatuses,
    likesCount: number,
    dislikesCount: number,
  ) {
    return this.PostModel.updateOne(
      { _id: postId },
      {
        $set: {
          'likes.$[elem].status': newStatus,
          likesCount,
          dislikesCount,
        },
      },
      { arrayFilters: [{ 'elem.userId': userId }] },
    );
  }
}
