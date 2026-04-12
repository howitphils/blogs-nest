/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { PostForBlogInputDto } from './../src/modules/blogs-platform/posts/api/dto/input/create-posts-for-blog-input.dto';
import { BlogInputDto } from './../src/modules/blogs-platform/blogs/api/dto/input/create-blog-input.dto';
import { describe, it, expect, afterAll, beforeAll } from '@jest/globals';
import { HttpStatus } from '@nestjs/common';
import { ErrorResponse } from '../src/modules/core/types/error-response.types';
import { defaultPagination } from '../src/modules/core/constants/query-params.constants';
import { req, testHelper } from './test.setup';
import { createBlogInputRestrictions } from '../src/modules/blogs-platform/blogs/api/dto/input/restrictions/create-blog-input.restrictions';
import { LikeStatuses } from '../src/modules/core/types/like-statuses.types';
import { createPostInputRestrictions } from '../src/modules/blogs-platform/posts/api/dto/input/restrictions/create-post-input.restrictions';
import { TestResponseType } from './response.type';
import { PaginationViewDto } from '../src/modules/core/dto/pagination.dto';
import { PostViewDto } from '../src/modules/blogs-platform/posts/api/dto/view/post-view.dto';

describe('Blogs Api (e2e)', () => {
  describe('GET /blogs', () => {
    beforeAll(async () => {
      await testHelper.createBlogsInDb(15);
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should return blogs with default pagination params', async () => {
      const res = await req.get('/blogs');

      expect(res.status).toBe(HttpStatus.OK);

      expect(res.body.page).toBe(defaultPagination.pageNumber);
      expect(res.body.pageSize).toBe(defaultPagination.pageSize);
      expect(res.body.pagesCount).toBe(2);
      expect(res.body.totalCount).toBe(15);
      expect(res.body.items.length).toBe(defaultPagination.pageSize);
      expect(res.body.items[0]).toEqual({
        id: expect.any(String),
        name: 'blog15',
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMemberShip: false,
      }); // Testing mapping + sorting direction(desc)
    });

    it('should return blogs with added query params', async () => {
      const res = await req.get(
        '/blogs?pageSize=7&pageNumber=2&sortDirection=asc',
      );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.pagesCount).toBe(3);
      expect(res.body.page).toBe(2);
      expect(res.body.items.length).toBe(7);
      expect(res.body.items[0]).toEqual({
        id: expect.any(String),
        name: 'blog8',
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMemberShip: false,
      }); // Testing mapping + sorting direction(asc)
    });

    it('should return blogs with added searchNameTerm', async () => {
      const res = await req.get('/blogs?searchNameTerm=lOG15');

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.pagesCount).toBe(1);
      expect(res.body.page).toBe(1);
      expect(res.body.items.length).toBe(1);
      expect(res.body.items[0]).toEqual({
        id: expect.any(String),
        name: 'blog15',
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMemberShip: false,
      });
    });
  });

  describe('GET* /blogs/:blogId/posts', () => {
    let blogId: string;

    beforeAll(async () => {
      blogId = await testHelper.createBlogInDb();
      const blogId2 = await testHelper.createBlogInDb('blog2');

      await Promise.all([
        testHelper.createPostsInDb(5, blogId),
        testHelper.createPostsInDb(10, blogId2),
      ]);
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    // let postIdToLike: string;
    it('should return posts with default pagination params', async () => {
      const res = await req.get(`/blogs/${blogId}/posts`);

      expect(res.status).toBe(HttpStatus.OK);

      expect(res.body.page).toBe(defaultPagination.pageNumber);
      expect(res.body.pageSize).toBe(defaultPagination.pageSize);
      expect(res.body.pagesCount).toBe(1);
      expect(res.body.totalCount).toBe(5);
      expect(res.body.items.length).toBe(5);
      expect(res.body.items[0]).toEqual({
        id: expect.any(String),
        blogId: blogId,
        title: 'post5',
        blogName: 'New Blog',
        shortDescription: 'description',
        content: 'content',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatuses.NONE,
          newestLikes: [],
        },
      }); // Testing mapping + sorting direction(desc)

      // postIdToLike = res.body.items[0].id;
    });

    // it('should return posts for blog for authorized user', async () => {
    //   const tokenService = new TokenService();

    //   const userId = await testHelper.createUserInDb({
    //     accountData: { login: 'user14' },
    //   });
    //   const token = tokenService.createAccessToken(userId);
    //   await testHelper.updatePostLikeStatus(
    //     postIdToLike,
    //     token,
    //     LikeStatuses.LIKE,
    //   );

    //   const res = await req
    //     .get(`/blogs/${blogId}/posts`)
    //     .set('Authorization', testHelper.getBearerAuthHeader(token));

    //   expect(res.status).toBe(HttpStatus.OK);

    //   expect(res.body.page).toBe(appSettings.pagination.DEFAULT_PAGE_NUMBER);
    //   expect(res.body.pageSize).toBe(appSettings.pagination.DEFAULT_PAGE_SIZE);
    //   expect(res.body.pagesCount).toBe(1);
    //   expect(res.body.totalCount).toBe(5);
    //   expect(res.body.items.length).toBe(5);
    //   expect(res.body.items[0].extendedLikesInfo).toEqual({
    //     likesCount: 1,
    //     dislikesCount: 0,
    //     myStatus: LikeStatuses.LIKE,
    //     newestLikes: [
    //       {
    //         addedAt: expect.any(String),
    //         login: 'user14',
    //         userId,
    //       },
    //     ],
    //   });
    // });

    it('should return posts with added query params', async () => {
      const res = await req.get(
        `/blogs/${blogId}/posts?pageSize=2&pageNumber=2&sortDirection=asc`,
      );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.pagesCount).toBe(3);
      expect(res.body.page).toBe(2);
      expect(res.body.items.length).toBe(2);
      expect(res.body.items[0]).toEqual({
        id: expect.any(String),
        blogId: blogId,
        title: 'post3',
        blogName: 'New Blog',
        shortDescription: 'description',
        content: 'content',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatuses.NONE,
          newestLikes: [],
        },
      }); // Testing mapping + sorting direction(asc)
    });

    it('should return 404 for non-existing blog', async () => {
      const incorrectId = testHelper.makeIncorrectId();

      const res = await req.get(`/blogs/${incorrectId}/posts`);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid id type', async () => {
      const res = await req.get('/blogs/abc/posts');

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('errorsMessages');
      expect(res.body.errorsMessages[0].field).toBe('id');
    });
  });

  describe('GET** /blogs/:id', () => {
    let blogId: string;

    beforeAll(async () => {
      blogId = await testHelper.createBlogInDb();
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should return a blog by id', async () => {
      const res = await req.get(`/blogs/${blogId}`);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toEqual({
        id: blogId,
        name: 'New Blog',
        description: 'A description for the new blog',
        websiteUrl: 'https://newblog.com',
        createdAt: expect.any(String),
        isMemberShip: false,
      });
    });

    it('should return 404 for non-existing blog', async () => {
      const incorrectId = testHelper.makeIncorrectId();

      const res = await req.get(`/blogs/${incorrectId}`);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid blog ID', async () => {
      const res = (await req.get('/blogs/abc')) as {
        status: HttpStatus;
        body: ErrorResponse;
      };

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('errorsMessages');
      expect(res.body.errorsMessages[0].field).toBe('id');
    });
  });

  describe('POST /blogs', () => {
    let blogInputDto: BlogInputDto;

    beforeAll(() => {
      blogInputDto = testHelper.createBlogInputDto();
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should create a new blog', async () => {
      const res = await req
        .post('/blogs')
        .set('Authorization', testHelper.getBasicAuthHeader())
        .send(blogInputDto);

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body).toEqual({
        id: expect.any(String),
        name: blogInputDto.name,
        description: blogInputDto.description,
        websiteUrl: blogInputDto.websiteUrl,
        createdAt: expect.any(String),
        isMemberShip: false,
      });
    });

    it('should return 400 for invalid blog data', async () => {
      const invalidBlogMaxValues = {
        name: 'a'.repeat(createBlogInputRestrictions.name.maxLength + 1),
        description: 'b'.repeat(
          createBlogInputRestrictions.description.maxLength + 1,
        ),
        websiteUrl: 'invalid-url',
      };

      const invalidBlogMinValues = {
        name: '',
        description: '',
        websiteUrl: '',
      };

      const invalidBlogWhiteSpaces = {
        name: '     ',
        description: '   ',
        websiteUrl: '   ',
      };

      const resArr = await Promise.all([
        testHelper.makePostRequest('/blogs', invalidBlogMinValues),
        testHelper.makePostRequest('/blogs', invalidBlogMaxValues),
        testHelper.makePostRequest('/blogs', invalidBlogWhiteSpaces),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages.length).toBe(3);
      }
    });

    it('should return 401 when no auth provided', async () => {
      const res = await req.post('/blogs').send(blogInputDto);

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST* /blogs/:blogId/posts', () => {
    let blogId: string;
    let newPostDto: PostForBlogInputDto;

    beforeAll(async () => {
      blogId = await testHelper.createBlogInDb();
      newPostDto = testHelper.createPostForBlogInputDto();
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should create a post for the blog', async () => {
      const res = await req
        .post(`/blogs/${blogId}/posts`)
        .set('Authorization', testHelper.getBasicAuthHeader())
        .send(newPostDto);
      console.log('🚀 ~ res:', res.body);

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body).toEqual({
        id: expect.any(String),
        title: newPostDto.title,
        content: newPostDto.content,
        shortDescription: newPostDto.shortDescription,
        blogId: blogId,
        blogName: 'random-blog',
        createdAt: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatuses.NONE,
          newestLikes: [],
        },
      });
    });

    it('should return 404 for not existing blog', async () => {
      const incorrectId = testHelper.makeIncorrectId();

      const res = await req
        .post(`/blogs/${incorrectId}/posts`)
        .set('Authorization', testHelper.getBasicAuthHeader())
        .send(newPostDto);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid post data', async () => {
      const invalidPostValuesMax: PostForBlogInputDto = {
        title: 'a'.repeat(createPostInputRestrictions.title.maxLength + 1),
        content: 'a'.repeat(createPostInputRestrictions.content.maxLength + 1),
        shortDescription: 'a'.repeat(
          createPostInputRestrictions.shortDescription.maxLength + 1,
        ),
      };

      const invalidPostValuesMin: PostForBlogInputDto = {
        title: '',
        content: '',
        shortDescription: '',
      };

      const invalidFormatValues = {
        title: 23,
        content: undefined,
        shortDescription: null,
      };

      const resArr = await Promise.all([
        testHelper.makePostRequest(
          `/blogs/${blogId}/posts`,
          invalidPostValuesMin,
        ),
        testHelper.makePostRequest(
          `/blogs/${blogId}/posts`,
          invalidPostValuesMax,
        ),
        testHelper.makePostRequest(
          `/blogs/${blogId}/posts`,
          invalidFormatValues,
        ),
      ]);

      for (const res of resArr) {
        expect(res.status).toBe(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages.length).toBe(3);
      }
    });

    it('should return 401 when no auth provided', async () => {
      const res = await req.post(`/blogs/${blogId}/posts`).send(newPostDto);

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for incorrect id type', async () => {
      const res = await req
        .post('/blogs/23/posts')
        .set('Authorization', testHelper.getBasicAuthHeader())
        .send(newPostDto);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('errorsMessages');
    });
  });

  describe('PUT /blogs/:id', () => {
    let blogId: string;

    let updatedBlog: BlogInputDto;

    beforeAll(async () => {
      blogId = await testHelper.createBlogInDb();

      updatedBlog = testHelper.createUpdatedBlogInputDto();

      await testHelper.createPostsInDb(3, blogId); // To check updating blogName property of post
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should update an existing blog', async () => {
      await req
        .put(`/blogs/${blogId}`)
        .set('Authorization', testHelper.getBasicAuthHeader())
        .send(updatedBlog)
        .expect(HttpStatus.NO_CONTENT);

      const getRes = await req.get(`/blogs/${blogId}`).expect(HttpStatus.OK);

      expect(getRes.body).toEqual({
        id: expect.any(String),
        name: updatedBlog.name,
        description: updatedBlog.description,
        websiteUrl: updatedBlog.websiteUrl,
        createdAt: expect.any(String),
        isMemberShip: false,
      });
    });

    it('should return all related posts with updated blogName property', async () => {
      const res = (await req
        .get(`/blogs/${blogId}/posts`)
        .expect(HttpStatus.OK)) as TestResponseType<
        PaginationViewDto<PostViewDto>
      >;

      const posts = res.body.items;

      expect(posts.length).toBe(3);

      for (const post of posts) {
        expect(post.blogName).toBe(updatedBlog.name);
      }
    });

    it('should return 404 when updating non-existing blog', async () => {
      const incorrectId = testHelper.makeIncorrectId();

      const res = await req
        .put(`/blogs/${incorrectId}`)
        .set('Authorization', testHelper.getBasicAuthHeader())
        .send(updatedBlog);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid blog data', async () => {
      const invalidBlogMaxValues = {
        name: 'a'.repeat(createBlogInputRestrictions.name.maxLength + 1),
        description: 'b'.repeat(
          createBlogInputRestrictions.description.maxLength + 1,
        ),
        websiteUrl: 'invalid-url',
      };

      const invalidBlogMinValues = {
        name: '',
        description: '',
        websiteUrl: '',
      };

      const resArr = await Promise.all([
        testHelper.makePutRequest(`/blogs/${blogId}`, invalidBlogMinValues),
        testHelper.makePutRequest(`/blogs/${blogId}`, invalidBlogMaxValues),
      ]);

      for (const res of resArr) {
        expect(HttpStatus.BAD_REQUEST);
        expect(res.body).toHaveProperty('errorsMessages');
        expect(res.body.errorsMessages.length).toBe(3);
      }
    });

    it('should return 400 for invalid blog Id', async () => {
      const res = await req
        .put('/blogs/asdc')
        .set('Authorization', testHelper.getBasicAuthHeader())
        .send(updatedBlog);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('errorsMessages');
    });

    it('should return 401 when no auth provided', async () => {
      await req
        .put(`/blogs/${blogId}`)
        .send(updatedBlog)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /blogs/:id', () => {
    let blogId: string;

    beforeAll(async () => {
      blogId = await testHelper.createBlogInDb();
    });

    afterAll(async () => {
      await testHelper.clearDatabase();
    });

    it('should delete an existing blog', async () => {
      const res = await req
        .delete(`/blogs/${blogId}`)
        .set('Authorization', testHelper.getBasicAuthHeader());

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
    });

    it('should return 404 when deleting non-existing blog', async () => {
      const res = await req
        .delete(`/blogs/${blogId}`)
        .set('Authorization', testHelper.getBasicAuthHeader())
        .expect(HttpStatus.NOT_FOUND);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 for invalid blog Id', async () => {
      const res = await req
        .delete("/blogs/'")
        .set('Authorization', testHelper.getBasicAuthHeader());

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('errorsMessages');
    });

    it('should return 401 when no auth provided', async () => {
      await req.delete(`/blogs/${blogId}`).expect(HttpStatus.UNAUTHORIZED);
    });
  });
});

// describe("Blogs API E2E", () => {
//   describe("GET /blogs", () => {
//     beforeAll(async () => {
//       await testHelper.createBlogsInDb(15);
//     });

//     afterAll(async () => {
//       await testHelper.clearDatabase();
//     });

//     it("should return blogs with default pagination params", async () => {
//       const res = await req.get("/blogs");

//       expect(res.status).toBe(HttpStatus.OK);

//       expect(res.body.page).toBe(appSettings.pagination.DEFAULT_PAGE_NUMBER);
//       expect(res.body.pageSize).toBe(appSettings.pagination.DEFAULT_PAGE_SIZE);
//       expect(res.body.pagesCount).toBe(2);
//       expect(res.body.totalCount).toBe(15);
//       expect(res.body.items.length).toBe(
//         appSettings.pagination.DEFAULT_PAGE_SIZE,
//       );
//       expect(res.body.items[0]).toEqual({
//         id: expect.any(String),
//         name: "blog15",
//         description: expect.any(String),
//         websiteUrl: expect.any(String),
//         createdAt: expect.any(String),
//         isMemberShip: false,
//       }); // Testing mapping + sorting direction(desc)
//     });

//     it("should return blogs with added query params", async () => {
//       const res = await req.get(
//         "/blogs?pageSize=7&pageNumber=2&sortDirection=asc",
//       );

//       expect(res.status).toBe(HttpStatus.OK);
//       expect(res.body.pagesCount).toBe(3);
//       expect(res.body.page).toBe(2);
//       expect(res.body.items.length).toBe(7);
//       expect(res.body.items[0]).toEqual({
//         id: expect.any(String),
//         name: "blog8",
//         description: expect.any(String),
//         websiteUrl: expect.any(String),
//         createdAt: expect.any(String),
//         isMemberShip: false,
//       }); // Testing mapping + sorting direction(asc)
//     });

//     it("should return blogs with added searchNameTerm", async () => {
//       const res = await req.get("/blogs?searchNameTerm=lOG15");

//       expect(res.status).toBe(HttpStatus.OK);
//       expect(res.body.pagesCount).toBe(1);
//       expect(res.body.page).toBe(1);
//       expect(res.body.items.length).toBe(1);
//       expect(res.body.items[0]).toEqual({
//         id: expect.any(String),
//         name: "blog15",
//         description: expect.any(String),
//         websiteUrl: expect.any(String),
//         createdAt: expect.any(String),
//         isMemberShip: false,
//       });
//     });
//   });

//   describe("GET* /blogs/:blogId/posts", () => {
//     let blogId: string;

//     beforeAll(async () => {
//       blogId = await testHelper.createBlogInDb();

//       await Promise.all([
//         testHelper.createPostsInDb(10),
//         testHelper.createPostsForBlogInDb(5, blogId),
//       ]);

//       expect(await testHelper.postsCount()).toBe(15);
//     });

//     afterAll(async () => {
//       await testHelper.clearDatabase();
//     });

//     let postIdToLike: string;
//     it("should return posts with default pagination params", async () => {
//       const res = await req.get(`/blogs/${blogId}/posts`);

//       expect(res.status).toBe(HttpStatus.OK);

//       expect(res.body.page).toBe(appSettings.pagination.DEFAULT_PAGE_NUMBER);
//       expect(res.body.pageSize).toBe(appSettings.pagination.DEFAULT_PAGE_SIZE);
//       expect(res.body.pagesCount).toBe(1);
//       expect(res.body.totalCount).toBe(5);
//       expect(res.body.items.length).toBe(5);
//       expect(res.body.items[0]).toEqual({
//         id: expect.any(String),
//         blogId: blogId,
//         title: "postForBlog5",
//         blogName: "random-blog",
//         shortDescription: "description",
//         content: "content",
//         createdAt: expect.any(String),
//         extendedLikesInfo: {
//           likesCount: 0,
//           dislikesCount: 0,
//           myStatus: LikeStatuses.NONE,
//           newestLikes: [],
//         },
//       }); // Testing mapping + sorting direction(desc)

//       postIdToLike = res.body.items[0].id;
//     });

//     it("should return posts for blog for authorized user", async () => {
//       const tokenService = new TokenService();

//       const userId = await testHelper.createUserInDb({
//         accountData: { login: "user14" },
//       });
//       const token = tokenService.createAccessToken(userId);
//       await testHelper.updatePostLikeStatus(
//         postIdToLike,
//         token,
//         LikeStatuses.LIKE,
//       );

//       const res = await req
//         .get(`/blogs/${blogId}/posts`)
//         .set("Authorization", testHelper.getBearerAuthHeader(token));

//       expect(res.status).toBe(HttpStatus.OK);

//       expect(res.body.page).toBe(appSettings.pagination.DEFAULT_PAGE_NUMBER);
//       expect(res.body.pageSize).toBe(appSettings.pagination.DEFAULT_PAGE_SIZE);
//       expect(res.body.pagesCount).toBe(1);
//       expect(res.body.totalCount).toBe(5);
//       expect(res.body.items.length).toBe(5);
//       expect(res.body.items[0].extendedLikesInfo).toEqual({
//         likesCount: 1,
//         dislikesCount: 0,
//         myStatus: LikeStatuses.LIKE,
//         newestLikes: [
//           {
//             addedAt: expect.any(String),
//             login: "user14",
//             userId,
//           },
//         ],
//       });
//     });

//     it("should return posts with added query params", async () => {
//       const res = await req.get(
//         `/blogs/${blogId}/posts?pageSize=2&pageNumber=2&sortDirection=asc`,
//       );

//       expect(res.status).toBe(HttpStatus.OK);
//       expect(res.body.pagesCount).toBe(3);
//       expect(res.body.page).toBe(2);
//       expect(res.body.items.length).toBe(2);
//       expect(res.body.items[0]).toEqual({
//         id: expect.any(String),
//         blogId: blogId,
//         title: "postForBlog3",
//         blogName: "random-blog",
//         shortDescription: "description",
//         content: "content",
//         createdAt: expect.any(String),
//         extendedLikesInfo: {
//           likesCount: 0,
//           dislikesCount: 0,
//           myStatus: LikeStatuses.NONE,
//           newestLikes: [],
//         },
//       }); // Testing mapping + sorting direction(asc)
//     });

//     it("should return 404 for non-existing blog", async () => {
//       const incorrectId = testHelper.makeIncorrectId();

//       const res = await req.get(`/blogs/${incorrectId}/posts`);

//       expect(res.status).toBe(HttpStatus.NOT_FOUND);
//       expect(res.body).toHaveProperty("message");
//     });

//     it("should return 400 for invalid id type", async () => {
//       const res = await req.get("/blogs/abc/posts");

//       expect(res.status).toBe(HttpStatus.BAD_REQUEST);
//       expect(res.body).toHaveProperty("errorsMessages");
//       expect(res.body.errorsMessages[0].field).toBe("id");
//     });
//   });

//   describe("GET** /blogs/:id", () => {
//     let blogId: string;

//     beforeAll(async () => {
//       blogId = await testHelper.createBlogInDb();
//     });

//     afterAll(async () => {
//       await testHelper.clearDatabase();
//     });

//     it("should return a blog by ID", async () => {
//       const res = await req.get(`/blogs/${blogId}`);

//       expect(res.status).toBe(HttpStatus.OK);
//       expect(res.body).toEqual({
//         id: blogId,
//         name: "random-blog",
//         description: "This is a test blog description",
//         websiteUrl: "https://testblog.com",
//         createdAt: expect.any(String),
//         isMemberShip: false,
//       });
//     });

//     it("should return 404 for non-existing blog", async () => {
//       const incorrectId = testHelper.makeIncorrectId();

//       const res = await req.get(`/blogs/${incorrectId}`);

//       expect(res.status).toBe(HttpStatus.NOT_FOUND);
//       expect(res.body).toHaveProperty("message");
//     });

//     it("should return 400 for invalid blog ID", async () => {
//       const res = await req.get("/blogs/abc");

//       expect(res.status).toBe(HttpStatus.BAD_REQUEST);
//       expect(res.body).toHaveProperty("errorsMessages");
//       expect(res.body.errorsMessages[0].field).toBe("id");
//     });
//   });

//

//
// });
