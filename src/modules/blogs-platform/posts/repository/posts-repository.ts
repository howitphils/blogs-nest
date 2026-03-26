import {
  PostDbDocument,
  PostDbModel,
  PostLikeDbModel,
  UpdatePostDtoModel,
} from "../types/posts-types";
import { PostNotFoundError } from "../application/errors/posts-errors";
import { injectable } from "inversify";
import { PostModel } from "./schemas/post-schema";
import { LikeStatuses } from "../../core/types/likes-types";

@injectable()
export class PostsRepository {
  async createPost(dto: PostDbModel): Promise<string> {
    const post = await PostModel.insertOne(dto);

    return post.id;
  }

  async getPostByIdOrFail(postId: string): Promise<PostDbDocument> {
    return PostModel.findById(postId).orFail(new PostNotFoundError());
  }

  async updatePost(dto: UpdatePostDtoModel): Promise<PostDbDocument> {
    return PostModel.findByIdAndUpdate(dto.id, {
      title: dto.title,
      blogId: dto.blogId,
      content: dto.content,
      shortDescription: dto.shortDescription,
    }).orFail(new PostNotFoundError());
  }

  async deletePost(postId: string): Promise<PostDbDocument> {
    return PostModel.findByIdAndDelete(postId).orFail(new PostNotFoundError());
  }

  async updateBlogNameForPost(blogId: string, blogName: string): Promise<void> {
    await PostModel.updateMany({ blogId }, { blogName });
  }

  async addPostLike(
    id: string,
    like: PostLikeDbModel,
    likesCount: number,
    dislikesCount: number,
  ): Promise<PostDbDocument> {
    return PostModel.findByIdAndUpdate(id, {
      $push: {
        likes: like,
      },
      $set: {
        likesCount,
        dislikesCount,
      },
    }).orFail(new PostNotFoundError());
  }

  async updatePostLikeStatus(
    postId: string,
    userId: string,
    newStatus: LikeStatuses,
    likesCount: number,
    dislikesCount: number,
  ) {
    return PostModel.updateOne(
      { _id: postId },
      {
        $set: {
          "likes.$[elem].status": newStatus,
          likesCount,
          dislikesCount,
        },
      },
      { arrayFilters: [{ "elem.userId": userId }] },
    );
  }
}
