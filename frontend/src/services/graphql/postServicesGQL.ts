import { PaginatedResponse, Post } from '@/interfaces/post';
import { baseGraphqlApi } from './baseGraphqlApi';
import { PostComment } from '@/interfaces/comment';

export const postServicesGQL = baseGraphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getPost: builder.query<Post, { postId: string }>({
      query: ({ postId }) => ({
        query: `
          query GetPost($postId: ID!) {
            getPost(postId: $postId) {
              post_id
              content
              media_url
              created_at
              updated_at
              visibility
              likeCount
              commentCount
              user {
                id
                username
                avatar
              }
            }
          }
        `,
        variables: { postId },
      }),
      transformResponse: (response: { getPost: Post }) => response.getPost,
    }),

    getPosts: builder.query<
      PaginatedResponse,
      { limit: number; cursor?: string }
    >({
      query: ({ limit, cursor }) => ({
        query: `
          query GetPosts($limit: Int!, $cursor: String) {
            getPosts(limit: $limit, cursor: $cursor) {
              edges {
                node {
                  post_id
                  content
                  media_url
                  created_at
                  updated_at
                  visibility
                  isLike
                  user {
                    id
                    full_name
                    avatar_url
                  }
                  comments {
                    comment_id
                    content
                    created_at
                    user {
                      id
                      full_name
                      avatar_url
                    }
                  }
                }
                cursor
                likeCount
                commentCount
              }
              pageInfo {
                endCursor
                hasNextPage
                total
              }
            }
          }
        `,
        variables: { limit, cursor },
      }),
      transformResponse: (response: { getPosts: PaginatedResponse }) =>
        response.getPosts,
    }),
    searchPosts: builder.query<
      PaginatedResponse,
      { query: string; limit: number; cursor?: string }
    >({
      query: ({ query, limit, cursor }) => ({
        query: `
          query SearchPosts($query: String!, $limit: Int!, $cursor: String) {
            searchPosts(query: $query, limit: $limit, cursor: $cursor) {
              message
              status
              edges {
                node {
                  post_id
                  content
                  media_url
                  created_at
                  visibility
                  isLike
                  user {
                    id
                    full_name
                    avatar_url
                  }
                  comments {
                    comment_id
                    content
                    created_at
                    user {
                      id
                      full_name
                      avatar_url
                    }
                  }
                }
                cursor
                likeCount
                commentCount
              }
              pageInfo {
                endCursor
                hasNextPage
                total
              }
            }
          }
        `,
        variables: { query, limit, cursor },
      }),
      transformResponse: (response: { searchPosts: PaginatedResponse }) =>
        response.searchPosts,
    }),
    likePost: builder.mutation<string, { postId: string }>({
      query: ({ postId }) => ({
        query: `
          mutation LikePost($postId: String!) {
            likePost(postId: $postId)
          }
        `,
        variables: { postId },
      }),
      transformResponse: (response: { likePost: string }) => response.likePost,
      invalidatesTags: ['Posts'], // Cập nhật lại danh sách bài đăng sau khi like
    }),

    unlikePost: builder.mutation<string, { postId: string }>({
      query: ({ postId }) => ({
        query: `
          mutation UnlikePost($postId: String!) {
            unlikePost(postId: $postId)
          }
        `,
        variables: { postId },
      }),
      transformResponse: (response: { unlikePost: string }) =>
        response.unlikePost,
      invalidatesTags: ['Posts'], // Cập nhật lại danh sách bài đăng sau khi unlike
    }),

    createComment: builder.mutation<
      PostComment,
      { postId: string; content: string }
    >({
      query: ({ postId, content }) => ({
        query: `
          mutation CreateComment($postId: String!, $content: String!) {
            createComment(postId: $postId, content: $content) {
              comment_id
              content
              created_at
              user {
                id
                full_name
                avatar_url
              }
              post {
                post_id
              }
            }
          }
        `,
        variables: { postId, content },
      }),
      transformResponse: (response: { createComment: PostComment }) =>
        response.createComment,
      invalidatesTags: ['Posts'], // Cập nhật lại danh sách bài đăng sau khi thêm comment
    }),

    deleteComment: builder.mutation<string, { commentId: string }>({
      query: ({ commentId }) => ({
        query: `
          mutation DeleteComment($commentId: String!) {
            deleteComment(commentId: $commentId)
          }
        `,
        variables: { commentId },
      }),
      transformResponse: (response: { deleteComment: string }) =>
        response.deleteComment,
      invalidatesTags: ['Posts'], // Cập nhật lại danh sách bài đăng sau khi xóa comment
    }),
  }),
});

export const {
  useGetPostQuery,
  useGetPostsQuery,
  useSearchPostsQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} = postServicesGQL;
