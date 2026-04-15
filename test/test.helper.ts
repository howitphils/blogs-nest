/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { PostForBlogInputDto } from './../src/modules/blogs-platform/posts/api/dto/input/create-posts-for-blog-input.dto';
import { ObjectId } from 'mongodb';
import { HttpStatus } from '@nestjs/common';
import { BlogInputDto } from '../src/modules/blogs-platform/blogs/api/dto/input/create-blog-input.dto';
import TestAgent from 'supertest/lib/agent';
import { PostInputDto } from '../src/modules/blogs-platform/posts/api/dto/input/create-post-input.dto';
import { UserInputDto } from '../src/modules/users-accounts/users/api/dto/input/create-user-input.dto';
import { LoginInputDto } from '../src/modules/users-accounts/users/api/dto/input/login-user-input.dto';
import { ThrottlerStorageOptions } from '@nestjs/throttler/dist/throttler-storage-options.interface';

// type UserOverridesType = {
//   accountData?: {
//     login?: string;
//     email?: string;
//     passwordHash?: string;
//   };
//   emailConfirmation?: {
//     confirmationCode?: string;
//     expDate?: Date;
//     isConfirmed?: boolean;
//   };
//   passwordRecovery?: {
//     recoveryCode?: string | null;
//     expDate?: Date;
//   };
// };

export class TestHelper {
  constructor(
    private req: TestAgent,
    private throttlerStorage: Map<string, ThrottlerStorageOptions>,
  ) {}

  async clearDatabase() {
    await this.req.delete('/testing/all-data').expect(HttpStatus.NO_CONTENT);
  }

  clearRedis() {
    // await redisClient.flushDb();
    console.log(this.throttlerStorage);

    this.throttlerStorage.clear();
  }

  makeIncorrectId() {
    return new ObjectId().toString();
  }

  async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // AUTH
  getBasicAuthHeader() {
    // const username = appConfig.ADMIN_CREDENTIALS.USERNAME;
    // const password = appConfig.ADMIN_CREDENTIALS.PASSWORD;
    const username = 'admin';
    const password = 'qwerty';

    const base64Credentials = Buffer.from(`${username}:${password}`).toString(
      'base64',
    );
    return `Basic ${base64Credentials}`;
  }

  getBearerAuthHeader(token: string) {
    return `Bearer ${token}`;
  }

  // BLOGS
  createBlogInputDto(name?: string): BlogInputDto {
    return {
      name: name || 'New Blog',
      description: 'A description for the new blog',
      websiteUrl: 'https://newblog.com',
    };
  }

  async createBlogInDb(name?: string): Promise<string> {
    const blogInputDto = this.createBlogInputDto(name);
    const res = await this.makePostRequest('/blogs', blogInputDto);

    return res.body.id;
  }

  createUpdatedBlogInputDto(): BlogInputDto {
    return {
      name: 'Updated Blog',
      description: 'Updated description',
      websiteUrl: 'https://updatedblog.com',
    };
  }

  // POSTS
  createPostInputDto(blogId: string, title?: string): PostInputDto {
    return {
      title: title || 'Test Post',
      shortDescription: 'description',
      content: 'content',
      blogId: blogId,
    };
  }

  createUpdatedPostInputDto(blogId: string): PostInputDto {
    return {
      title: 'Updated',
      content: 'Updated',
      blogId,
      shortDescription: 'Updated',
    };
  }

  createPostForBlogInputDto(): PostForBlogInputDto {
    return {
      title: 'Test Post',
      shortDescription: 'This is a test post short description',
      content: 'This is the content of the test post',
    };
  }

  async createPostInDb(blogId: string, title?: string): Promise<string> {
    const postInputDto = this.createPostInputDto(blogId, title);

    const res = await this.makePostRequest('/posts', postInputDto);

    return res.body.id;
  }

  // USERS
  createUserInputDto(
    login?: string,
    email?: string,
    password?: string,
  ): UserInputDto {
    return {
      login: login ?? 'user12',
      email: email ?? 'user@gmail.com',
      password: password ?? '1234567',
    };
  }

  // createDbUser(overrides: UserOverridesType = {}) {
  //   return {
  //     accountData: {
  //       login: `user${Math.random().toFixed(3)}`,
  //       email: `some-email${Math.random().toFixed(3)}@email.com`,
  //       createdAt: new Date().toISOString(),
  //       passwordHash: 'somepasshash',
  //       ...overrides.accountData,
  //     },
  //     emailConfirmation: {
  //       confirmationCode: randomUUID(),
  //       expDate: addHours(new Date(), 2),
  //       isConfirmed: false,
  //       ...overrides.emailConfirmation,
  //     },
  //     passwordRecovery: {
  //       recoveryCode: null,
  //       expDate: new Date(),
  //       ...overrides.passwordRecovery,
  //     },
  //   };
  // }

  async createUserInDb(
    login?: string,
    email?: string,
    password?: string,
  ): Promise<string> {
    const newUserDto = this.createUserInputDto(login, email, password);

    const res = await this.makePostRequest('/users', newUserDto);

    return res.body.id;
  }

  // async countSessions(): Promise<number> {
  //   return SessionModel.countDocuments();
  // }

  // async countUsers(): Promise<number> {
  //   return UserModel.countDocuments();
  // }

  // // COMMENTS
  // createCommentInputDto(content?: string) {
  //   return {
  //     content:
  //       content ?? 'a'.repeat(commentInputRestrictions.content.minLength),
  //   };
  // }

  // async createCommentInDb(content?: string, postId?: string, userId?: string) {
  //   const newComment: CommentDbModel = {
  //     content: content || 'content',
  //     postId: postId || 'postId',
  //     userLogin: 'userLogin',
  //     userId: userId || 'userId',
  //     createdAt: new Date().toISOString(),
  //     dislikesCount: 0,
  //     likesCount: 0,
  //   };

  //   const comment = await CommentModel.insertOne(newComment);

  //   return comment.id;
  // }

  // async countComments(): Promise<number> {
  //   return CommentModel.countDocuments();
  // }

  // LOGIN
  createLoginInputDto(loginOrEmail: any, password?: any) {
    return {
      loginOrEmail,
      password: password ?? '1234567',
    };
  }

  // createLoginInfoDto(loginOrEmail: string): LoginInfo {
  //   return {
  //     loginOrEmail: loginOrEmail,
  //     password: '123567',
  //     deviceName: 'some-device',
  //     ip: 'some-ip',
  //   };
  // }

  async loginUser(dto: LoginInputDto) {
    const res = await this.req
      .post('/auth/login')
      .send(dto)
      .expect(HttpStatus.OK);

    return {
      accessToken: res.body.accessToken,
      // cookie: res.headers['set-cookie'][0],
    };
  }

  // async loginUserFromDevices(amount: number, dto: LoginInputDto) {
  //   const cookiesArr: string[] = [];

  //   for (let i = 1; i <= amount; i++) {
  //     const res = await this.req
  //       .post('/auth/login')
  //       .set('user-agent', `device${i}`)
  //       .send(dto)
  //       .expect(HttpStatus.OK);

  //     cookiesArr.push(res.headers['set-cookie'][0]);
  //   }

  //   return cookiesArr;
  // }

  // INSERT MULTIPLE DOCUMENTS
  async createBlogsInDb(amount: number) {
    for (let i = 1; i <= amount; i++) {
      await this.createBlogInDb(`blog${i}`);
    }
  }

  async createPostsInDb(amount: number, blogId: string) {
    for (let i = 1; i <= amount; i++) {
      await this.createPostInDb(blogId, `post${i}`);
    }
  }

  async createUsersInDb(amount: number) {
    for (let i = 1; i <= amount; i++) {
      await this.createUserInDb(`user${i}`, `email${i}@gmail.com`);
    }
  }

  // async createCommentsInDb(amount: number, postId: string) {
  //   for (let i = 1; i <= amount; i++) {
  //     await testHelper.createCommentInDb(`content${i}`, postId);
  //   }
  // }

  // CUSTOM REQUESTS
  async makePostRequest(path: string, dto: any) {
    return this.req
      .post(path)
      .set('Authorization', this.getBasicAuthHeader())
      .send(dto);
  }

  // async makePostRequestJwt(path: string, token: string, dto: any) {
  //   return this.req
  //     .post(path)
  //     .set('Authorization', testHelper.getBearerAuthHeader(token))
  //     .send(dto);
  // }

  async makePutRequest(path: string, dto: any) {
    return this.req
      .put(path)
      .set('Authorization', this.getBasicAuthHeader())
      .send(dto);
  }

  // async makeRequestsLimit(path: string) {
  //   for (let i = 1; this.i <= appConfig.REQUEST_LIMIT; i++) {
  //     await req.post(path).send({}).expect(HttpStatus.BAD_REQUEST);
  //   }
  // }

  // async getLikedComment(commentId: string, token: string) {
  //   return this.req
  //     .get(`/comments/${commentId}`)
  //     .set('Authorization', testHelper.getBearerAuthHeader(token))
  //     .expect(HttpStatus.OK);
  // }

  // async updateCommentLikeStatus(
  //   commentId: string,
  //   token: string,
  //   likeStatus: LikeStatuses,
  // ) {
  //   return this.req
  //     .put(`/comments/${commentId}/like-status`)
  //     .set('Authorization', testHelper.getBearerAuthHeader(token))
  //     .send({ likeStatus })
  //     .expect(HttpStatus.NO_CONTENT);
  // }

  // async updatePostLikeStatus(
  //   postId: string,
  //   token: string,
  //   likeStatus: LikeStatuses,
  // ) {
  //   return this.req
  //     .put(`/posts/${postId}/like-status`)
  //     .set('Authorization', testHelper.getBearerAuthHeader(token))
  //     .send({ likeStatus })
  //     .expect(HttpStatus.NO_CONTENT);
  // }

  // async getLikedPost(postId: string, token: string) {
  //   return this.req
  //     .get(`/posts/${postId}`)
  //     .set('Authorization', testHelper.getBearerAuthHeader(token))
  //     .expect(HttpStatus.OK);
  // }
}
