import { Post } from '@/interfaces/post';
import { baseRestApi } from './baseRestApi';
import { ApiResponse } from '@/interfaces/apiResponse';

const entity = 'posts';

export const postServices = baseRestApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tạo bài đăng
    createPost: builder.mutation<
      { data: Post; message: string; status: number },
      { data: FormData }
    >({
      query: ({ data }) => ({
        url: `${entity}`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Post>) => ({
        data: response.data,
        message: response.message,
        status: response.status,
      }),
    }),

    // Cập nhật bài đăng
    updatePost: builder.mutation<
      { data: Post; message: string; status: number },
      { postId: string; data: FormData }
    >({
      query: ({ postId, data }) => ({
        url: `${entity}/${postId}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Post>) => ({
        data: response.data,
        message: response.message,
        status: response.status,
      }),
    }),

    // Xóa bài đăng
    deletePost: builder.mutation<{ message: string; status: number }, string>({
      query: (postId) => ({
        url: `${entity}/${postId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<void>) => ({
        message: response.message,
        status: response.status,
      }),
    }),
  }),
});

export const {
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = postServices;
