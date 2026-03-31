import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../blogs/repository/blogs-repository';
import { PostsRepository } from '../repository/posts-repository';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdatePostLikeStatusDto } from './dto/update-post-like-status.dto';
import { LikeStatuses } from '../../../core/types/like-statuses';
import { UsersRepository } from '../../../users-accounts/users/repository/users.repository';

@Injectable()
export class PostsService {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private usersRepository: UsersRepository,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const { blogId, content, shortDescription, title } = dto;

    const blog = await this.blogsRepository.getBlogByIdOrFail(dto.blogId);

    const postId = await this.postsRepository.createPost({
      blogId,
      blogName: blog.name,
      content,
      shortDescription,
      title,
    });

    return postId;
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
      post.addLike({
        status: dto.likeStatus,
        postId: post.id,
        userId: dto.userId,
        login: user.accountData.login,
      });

      await this.postsRepository.save(post);

      return;
    }

    if (like.status === dto.likeStatus) return;

    // IF NONE
    if (dto.likeStatus === LikeStatuses.NONE) {
      if (like.status === LikeStatuses.LIKE) {
        post.updateLikesCount(post.likesCount - 1);
      } else if (like.status === LikeStatuses.DISLIKE) {
        post.updateDislikesCount(post.dislikesCount - 1);
      }
    }

    //IF LIKED
    if (dto.likeStatus === LikeStatuses.LIKE) {
      if (like.status === LikeStatuses.NONE) {
        post.updateLikesCount(post.likesCount + 1);
      } else if (like.status === LikeStatuses.DISLIKE) {
        post.updateLikesCount(post.likesCount + 1);
        post.updateDislikesCount(post.dislikesCount - 1);
      }
    }

    //IF DISLIKED
    if (dto.likeStatus === LikeStatuses.DISLIKE) {
      if (like.status === LikeStatuses.NONE) {
        post.updateDislikesCount(post.dislikesCount + 1);
      } else if (like.status === LikeStatuses.LIKE) {
        post.updateDislikesCount(post.dislikesCount + 1);
        post.updateLikesCount(post.likesCount - 1);
      }
    }

    like.updateStatus(dto.likeStatus);

    await this.postsRepository.save(post);
  }

  async deletePost(postId: string): Promise<void> {
    const post = await this.postsRepository.getPostByIdOrFail(postId);

    post.delete();

    await this.postsRepository.save(post);
  }
}
