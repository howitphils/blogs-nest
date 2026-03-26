import { PostsRepository } from "./../repository/posts-repository";
import { inject, injectable } from "inversify";
import { BlogsRepository } from "../../blogs/repository/blogs-repository";
import {
  PostDbModel,
  PostInputModel,
  PostLikeDbModel,
  UpdatePostDtoModel,
  UpdatePostLikeStatusDto,
} from "../types/posts-types";
import { UsersRepository } from "../../users/repository/users-repository";
import { LikeStatuses } from "../../core/types/likes-types";

@injectable()
export class PostsService {
  constructor(
    @inject(BlogsRepository) private blogsRepository: BlogsRepository,
    @inject(PostsRepository) private postsRepository: PostsRepository,
    @inject(UsersRepository) private usersRepository: UsersRepository,
  ) {}

  async createPost(dto: PostInputModel): Promise<string> {
    const blog = await this.blogsRepository.getBlogByIdOrFail(dto.blogId);

    const newPost: PostDbModel = {
      title: dto.title,
      blogId: dto.blogId,
      blogName: blog.name,
      content: dto.content,
      createdAt: new Date().toISOString(),
      shortDescription: dto.shortDescription,
      likes: [],
      dislikesCount: 0,
      likesCount: 0,
    };

    return this.postsRepository.createPost(newPost);
  }

  async updatePost(dto: UpdatePostDtoModel): Promise<void> {
    await this.postsRepository.updatePost(dto);
  }

  async updatePostLikeStatus(dto: UpdatePostLikeStatusDto): Promise<void> {
    const post = await this.postsRepository.getPostByIdOrFail(dto.postId);
    const user = await this.usersRepository.getUserByIdOrFail(dto.userId);

    const like = post.likes.find((like) => like.userId === dto.userId);

    if (!like) {
      const newLike: PostLikeDbModel = {
        login: user.accountData.login,
        status: dto.likeStatus,
        postId: dto.postId,
        userId: dto.userId,
        createdAt: new Date().toISOString(),
      };

      if (dto.likeStatus === LikeStatuses.LIKE) {
        await this.postsRepository.addPostLike(
          dto.postId,
          newLike,
          post.likesCount + 1,
          post.dislikesCount,
        );
      } else if (dto.likeStatus === LikeStatuses.DISLIKE) {
        await this.postsRepository.addPostLike(
          dto.postId,
          newLike,
          post.likesCount,
          post.dislikesCount - 1,
        );
      }

      return;
    }

    if (like.status === dto.likeStatus) return;

    // IF NONE
    if (dto.likeStatus === LikeStatuses.NONE) {
      if (like.status === LikeStatuses.LIKE) {
        await this.postsRepository.updatePostLikeStatus(
          dto.postId,
          dto.userId,
          dto.likeStatus,
          post.likesCount - 1,
          post.dislikesCount,
        );
      } else if (like.status === LikeStatuses.DISLIKE) {
        await this.postsRepository.updatePostLikeStatus(
          dto.postId,
          dto.userId,
          dto.likeStatus,
          post.likesCount,
          post.dislikesCount - 1,
        );
      }
    }

    //IF LIKED
    if (dto.likeStatus === LikeStatuses.LIKE) {
      if (like.status === LikeStatuses.NONE) {
        await this.postsRepository.updatePostLikeStatus(
          dto.postId,
          dto.userId,
          dto.likeStatus,
          post.likesCount + 1,
          post.dislikesCount,
        );
      } else if (like.status === LikeStatuses.DISLIKE) {
        await this.postsRepository.updatePostLikeStatus(
          dto.postId,
          dto.userId,
          dto.likeStatus,
          post.likesCount + 1,
          post.dislikesCount - 1,
        );
      }
    }

    //IF DISLIKED
    if (dto.likeStatus === LikeStatuses.DISLIKE) {
      if (like.status === LikeStatuses.NONE) {
        await this.postsRepository.updatePostLikeStatus(
          dto.postId,
          dto.userId,
          dto.likeStatus,
          post.likesCount,
          post.dislikesCount + 1,
        );
      } else if (like.status === LikeStatuses.LIKE) {
        await this.postsRepository.updatePostLikeStatus(
          dto.postId,
          dto.userId,
          dto.likeStatus,
          post.likesCount - 1,
          post.dislikesCount + 1,
        );
      }
    }
  }

  async deletePost(postId: string): Promise<void> {
    await this.postsRepository.deletePost(postId);
  }
}
