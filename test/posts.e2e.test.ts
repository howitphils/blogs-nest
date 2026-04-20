/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { HttpStatus } from '@nestjs/common';
import { LikeStatuses } from '../src/modules/core/types/like-statuses.types';
import { testHelper, req } from './test.setup';
import { defaultPagination } from '../src/modules/core/constants/query-params.constants';
import { PostInputDto } from '../src/modules/blogs-platform/posts/api/dto/input/create-post-input.dto';
import { createPostInputRestrictions } from '../src/modules/blogs-platform/posts/api/dto/input/restrictions/create-post-input.restrictions';

describe('Posts API', () => {
  // const tokenService = app.get(TokenService);

  describe('GET /posts', () => {
    beforeAll(async () => {
      const blogId = await testHelper.createBlogInDb();
      await testHelper.createPostsInDb(15, blogId);
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    // let postIdToLike: string;

    it('should return posts with default pagination params', async () => {
      const res = await req.get('/posts');

      expect(res.status).toBe(HttpStatus.OK);

      expect(res.body.page).toBe(defaultPagination.pageNumber);
      expect(res.body.pageSize).toBe(defaultPagination.pageSize);
      expect(res.body.pagesCount).toBe(2);
      expect(res.body.totalCount).toBe(15);
      expect(res.body.items.length).toBe(defaultPagination.pageSize);

      // postIdToLike = res.body.items[0].id;
    });

    // it('should return posts for authorized user', async () => {
    //   const userId = await testHelper.createUserInDb({
    //     accountData: { login: 'user12' },
    //   });
    //   const token = tokenService.createAccessToken(userId);
    //   await testHelper.updatePostLikeStatus(
    //     postIdToLike,
    //     token,
    //     LikeStatuses.LIKE,
    //   );

    //   const res = await req
    //     .get('/posts')
    //     .set('Authorization', testHelper.getBearerAuthHeader(token));

    //   expect(res.status).toBe(HttpStatus.OK);

    //   expect(res.body.page).toBe(appSettings.pagination.DEFAULT_PAGE_NUMBER);
    //   expect(res.body.pageSize).toBe(appSettings.pagination.DEFAULT_PAGE_SIZE);
    //   expect(res.body.pagesCount).toBe(2);
    //   expect(res.body.totalCount).toBe(15);
    //   expect(res.body.items.length).toBe(
    //     appSettings.pagination.DEFAULT_PAGE_SIZE,
    //   );
    //   expect(res.body.items[0].extendedLikesInfo).toEqual({
    //     likesCount: 1,
    //     dislikesCount: 0,
    //     myStatus: LikeStatuses.LIKE,
    //     newestLikes: [
    //       {
    //         addedAt: expect.any(String),
    //         login: 'user12',
    //         userId,
    //       },
    //     ],
    //   });
    // });

    it('should return posts with added query params', async () => {
      const res = await req.get(
        '/posts?pageSize=3&pageNumber=2&sortDirection=asc',
      );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.pagesCount).toBe(5);
      expect(res.body.page).toBe(2);
      expect(res.body.items.length).toBe(3);
      expect(res.body.items[0]).toEqual({
        title: 'post4',
        id: expect.any(String),
        blogId: expect.any(String),
        blogName: expect.any(String),
        shortDescription: expect.any(String),
        content: expect.any(String),
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatuses.NONE,
          newestLikes: [],
        },
      });
    });
  });

  describe('GET* /posts/:id', () => {
    let blogId: string;
    let postId: string;

    beforeAll(async () => {
      blogId = await testHelper.createBlogInDb();
      postId = await testHelper.createPostInDb(blogId);
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should return a post by Id', async () => {
      const res = await req.get(`/posts/${postId}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toEqual({
        id: postId,
        title: 'Test Post',
        blogId,
        blogName: 'New Blog',
        content: 'content',
        shortDescription: 'description',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatuses.NONE,
          newestLikes: [],
        },
      });
    });

    it('should return 404 for non-existing post', async () => {
      const incorrectId = testHelper.makeIncorrectId();

      await req.get(`/posts/${incorrectId}`).expect(HttpStatus.NOT_FOUND);
    });

    it('should return 400 for invalid id type', async () => {
      const res = await req.get('/posts/23');

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('errorsMessages');
    });
  });

  describe('DELETE /posts/:id', () => {
    let postId: string;

    beforeAll(async () => {
      const blogId = await testHelper.createBlogInDb();
      postId = await testHelper.createPostInDb(blogId);
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should delete a post by ID', async () => {
      await req
        .delete(`/posts/${postId}`)
        .set('Authorization', testHelper.getBasicAuthHeader())
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 404 when deleting non-existing post', async () => {
      const res = await req
        .delete(`/posts/${postId}`)
        .set('Authorization', testHelper.getBasicAuthHeader())
        .expect(HttpStatus.NOT_FOUND);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 401 when unauthorized', async () => {
      await req
        .delete(`/posts/${postId}`)
        .set('Authorization', 'InvalidToken')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 for invalid id type', async () => {
      const res = await req
        .delete('/posts/23')
        .set('Authorization', testHelper.getBasicAuthHeader());

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('errorsMessages');
    });
  });

  describe('POST /posts', () => {
    let blogId: string;
    let newPostDto: PostInputDto;

    beforeAll(async () => {
      blogId = await testHelper.createBlogInDb('test-blog');
      newPostDto = testHelper.createPostInputDto(blogId);
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should create a new post', async () => {
      const res = await req
        .post('/posts')
        .set('Authorization', testHelper.getBasicAuthHeader())
        .send(newPostDto);

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body).toEqual({
        id: expect.any(String),
        title: newPostDto.title,
        content: newPostDto.content,
        shortDescription: newPostDto.shortDescription,
        blogId: blogId,
        blogName: 'test-blog',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatuses.NONE,
          newestLikes: [],
        },
      });
    });

    it('should return 400 for invalid post data', async () => {
      const invalidPostMinValues = {
        title: '',
        content: '',
        shortDescription: '',
        blogId: 23,
      };

      const invalidPostMaxValues = {
        title: 'a'.repeat(createPostInputRestrictions.title.maxLength + 1),
        content: 'a'.repeat(createPostInputRestrictions.content.maxLength + 1),
        shortDescription: 'a'.repeat(
          createPostInputRestrictions.shortDescription.maxLength + 1,
        ),
        blogId: 12,
      };

      const resArr = await Promise.all([
        testHelper.makePostRequest('/posts', invalidPostMinValues),
        testHelper.makePostRequest('/posts', invalidPostMaxValues),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages.length).toBe(4);
      }
    });

    it('should return 401 when unauthorized', async () => {
      await req.post('/posts').send(newPostDto).expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 404 for not existing blog', async () => {
      const incorrectId = testHelper.makeIncorrectId();
      const postDto = testHelper.createPostInputDto(incorrectId);

      const res = await req
        .post(`/posts`)
        .set('Authorization', testHelper.getBasicAuthHeader())
        .send(postDto);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('PUT /posts/:id', () => {
    let postId: string;
    let updatedPostData: PostInputDto;

    beforeAll(async () => {
      const blogId = await testHelper.createBlogInDb();
      postId = await testHelper.createPostInDb(blogId);

      updatedPostData = testHelper.createUpdatedPostInputDto(blogId);
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should update a post by Id', async () => {
      await req
        .put(`/posts/${postId}`)
        .set('Authorization', testHelper.getBasicAuthHeader())
        .send(updatedPostData)
        .expect(HttpStatus.NO_CONTENT);

      const res = await req.get(`/posts/${postId}`).expect(HttpStatus.OK);

      expect(res.body.title).toBe(updatedPostData.title);
      expect(res.body.shortDescription).toBe(updatedPostData.shortDescription);
      expect(res.body.content).toBe(updatedPostData.content);
    });

    it('should return 401 when unauthorized', async () => {
      await req
        .put(`/posts/${postId}`)
        .send(updatedPostData)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 404 for non-existing post', async () => {
      const incorrectId = testHelper.makeIncorrectId();

      const res = await req
        .put(`/posts/${incorrectId}`)
        .set('Authorization', testHelper.getBasicAuthHeader())
        .send(updatedPostData);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid post data', async () => {
      const invalidPostMinValues = {
        title: '',
        content: '',
        shortDescription: '',
        blogId: 23,
      };

      const invalidPostMaxValues = {
        title: 'a'.repeat(createPostInputRestrictions.title.maxLength + 1),
        content: 'a'.repeat(createPostInputRestrictions.content.maxLength + 1),
        shortDescription: 'a'.repeat(
          createPostInputRestrictions.shortDescription.maxLength + 1,
        ),
        blogId: 12,
      };

      const resArr = await Promise.all([
        testHelper.makePutRequest(`/posts/${postId}`, invalidPostMinValues),
        testHelper.makePutRequest(`/posts/${postId}`, invalidPostMaxValues),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages.length).toBe(4);
      }
    });
  });

  // describe('PUT /posts/:id/like-status', () => {
  //   let postId: string;
  //   let userId: string;
  //   let token: string;
  //   let likeStatusInputDto: UpdateLikeStatusInputDto;

  //   beforeAll(async () => {
  //     userId = await testHelper.createUserInDb({
  //       accountData: { login: 'user22' },
  //     });
  //     postId = await testHelper.createPostInDb();
  //     token = tokenService.createAccessToken(userId);

  //     likeStatusInputDto = { likeStatus: LikeStatuses.LIKE };
  //   });

  //   afterAll(async () => {
  //     await testHelper.clearDatabase();
  //   });

  //   it('should create a like for a post and add like status + likes count properly', async () => {
  //     await testHelper.updatePostLikeStatus(postId, token, LikeStatuses.LIKE);
  //     const res = await testHelper.getLikedPost(postId, token);

  //     expect(res.body.extendedLikesInfo).toEqual({
  //       likesCount: 1,
  //       dislikesCount: 0,
  //       myStatus: LikeStatuses.LIKE,
  //       newestLikes: [
  //         {
  //           addedAt: expect.any(String),
  //           login: 'user22',
  //           userId,
  //         },
  //       ],
  //     });
  //   });

  //   it('should not change likes count if new status is the same', async () => {
  //     await testHelper.updatePostLikeStatus(postId, token, LikeStatuses.LIKE);
  //     const res = await testHelper.getLikedPost(postId, token);

  //     expect(res.body.extendedLikesInfo).toEqual({
  //       likesCount: 1,
  //       dislikesCount: 0,
  //       myStatus: LikeStatuses.LIKE,
  //       newestLikes: [
  //         {
  //           addedAt: expect.any(String),
  //           login: 'user22',
  //           userId,
  //         },
  //       ],
  //     });
  //   });

  //   it('should properly change like status', async () => {
  //     //DISLIKE
  //     await testHelper.updatePostLikeStatus(
  //       postId,
  //       token,
  //       LikeStatuses.DISLIKE,
  //     );
  //     const res = await testHelper.getLikedPost(postId, token);

  //     expect(res.body.extendedLikesInfo).toEqual({
  //       likesCount: 0,
  //       dislikesCount: 1,
  //       myStatus: LikeStatuses.DISLIKE,
  //       newestLikes: [],
  //     });

  //     //NONE
  //     await testHelper.updatePostLikeStatus(postId, token, LikeStatuses.NONE);
  //     const res2 = await testHelper.getLikedPost(postId, token);

  //     expect(res2.body.extendedLikesInfo).toEqual({
  //       likesCount: 0,
  //       dislikesCount: 0,
  //       myStatus: LikeStatuses.NONE,
  //       newestLikes: [],
  //     });

  //     //LIKE
  //     await testHelper.updatePostLikeStatus(postId, token, LikeStatuses.LIKE);
  //     const res3 = await testHelper.getLikedPost(postId, token);

  //     expect(res3.body.extendedLikesInfo).toEqual({
  //       likesCount: 1,
  //       dislikesCount: 0,
  //       myStatus: LikeStatuses.LIKE,
  //       newestLikes: [
  //         {
  //           addedAt: expect.any(String),
  //           login: 'user22',
  //           userId,
  //         },
  //       ],
  //     });
  //   });

  //   it('should properly change like status for another user', async () => {
  //     const user2Id = await testHelper.createUserInDb({
  //       accountData: { login: 'user23' },
  //     });
  //     const token2 = tokenService.createAccessToken(user2Id);

  //     await testHelper.updatePostLikeStatus(postId, token2, LikeStatuses.LIKE);
  //     const res = await testHelper.getLikedPost(postId, token2);

  //     expect(res.body.extendedLikesInfo).toEqual({
  //       likesCount: 2,
  //       dislikesCount: 0,
  //       myStatus: LikeStatuses.LIKE,
  //       newestLikes: [
  //         {
  //           addedAt: expect.any(String),
  //           login: 'user23',
  //           userId: user2Id,
  //         },
  //         {
  //           addedAt: expect.any(String),
  //           login: 'user22',
  //           userId,
  //         },
  //       ],
  //     });
  //   });

  //   it('should return 401 when unauthorized', async () => {
  //     await req
  //       .put(`/posts/${postId}/like-status`)
  //       .send(likeStatusInputDto)
  //       .expect(HttpStatus.UNAUTHORIZED);
  //   });

  //   it('should return 404 for non-existing comment', async () => {
  //     const incorrectId = testHelper.makeIncorrectId();

  //     const res = await req
  //       .put(`/posts/${incorrectId}/like-status`)
  //       .set('Authorization', testHelper.getBearerAuthHeader(token))
  //       .send(likeStatusInputDto);

  //     expect(res.status).toBe(HttpStatus.NOT_FOUND);
  //     expect(res.body).toHaveProperty('message');
  //     expect(res.body.message).toContain('Post');
  //   });

  //   it('should return 400 for invalid comment data', async () => {
  //     const invalidLikeStatus = {
  //       likeStatus: 'some',
  //     };

  //     const invalidLikeStatusFormat = {
  //       likeStatus: 22312,
  //     };

  //     const resArr = await Promise.all([
  //       req
  //         .put(`/posts/${postId}/like-status`)
  //         .set('Authorization', testHelper.getBearerAuthHeader(token))
  //         .send(invalidLikeStatus),
  //       req
  //         .put(`/posts/${postId}/like-status`)
  //         .set('Authorization', testHelper.getBearerAuthHeader(token))
  //         .send(invalidLikeStatusFormat),
  //       req
  //         .put(`/posts/${postId}/like-status`)
  //         .set('Authorization', testHelper.getBearerAuthHeader(token))
  //         .send({}),
  //     ]);

  //     for (const res of resArr) {
  //       expect(res.status).toBe(HttpStatus.BAD_REQUEST);
  //       expect(res.body).toHaveProperty('errorsMessages');
  //       expect(res.body.errorsMessages.length).toBe(1);
  //     }
  //   });
  // });
});
