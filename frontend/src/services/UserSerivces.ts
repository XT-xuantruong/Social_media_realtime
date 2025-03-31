import { baseRestApi } from './baseRestApi';
import { UpdateUserDto, UserInfo } from '@/interfaces/user';
import { ApiResponse } from '@/interfaces/apiResponse';

const entity = 'users';

export const userServices = baseRestApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<{ data: UserInfo; message: string }, void>({
      query: () => ({
        url: `${entity}/me`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<UserInfo>) => ({
        data: response.data,
        message: response.message,
      }),
    }),
    updateUser: builder.mutation<{ data: UserInfo; message: string }, UpdateUserDto>({
      query: (userData) => ({
        url: 'users/me',
        method: 'PATCH',
        body: userData,
      }),
      transformResponse: (response: ApiResponse<UserInfo>) => ({
        data: response.data,
        message: response.message,
      }),
    }),
  }),
});

export const { useGetMeQuery } = userServices;
