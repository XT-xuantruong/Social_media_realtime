import { baseRestApi } from './baseRestApi';
import { UserInfo } from '@/interfaces/user';
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
  }),
});

export const { useGetMeQuery } = userServices;
