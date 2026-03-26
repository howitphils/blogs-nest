import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/repository/blogs-repository';
import { PostsRepository } from '../repository/posts-repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    // private usersRepository: UsersRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const { blogId, content, shortDescription, title } = dto;

    const blog = await this.blogsRepository.getBlogByIdOrFail(dto.blogId);

    return this.postsRepository.createPost({
      blogId,
      blogName: blog.name,
      content,
      shortDescription,
      title,
    });
  }

  async updatePost(dto: UpdatePostDto): Promise<void> {
    const { blogId, content, shortDescription, postId, title } = dto;

    const post = await this.postsRepository.getPostByIdOrFail(postId);

    post.update({ blogId, content, shortDescription, title });

    await this.postsRepository.save(post);
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
    const post = await this.postsRepository.getPostByIdOrFail(postId);

    post.delete();

    await this.postsRepository.save(post);
  }
}
