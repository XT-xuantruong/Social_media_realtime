import { baseRestApi } from './baseRestApi';
import { UpdateUserDto, UserInfo } from '@/interfaces/user';
import { ApiResponse } from '@/interfaces/apiResponse';
import { RootState } from '@/stores';
import { setUser } from '@/stores/authSlice';

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
    updateUser: builder.mutation<
      { data: UserInfo; message: string },
      { data: UpdateUserDto; file?: File }
    >({
      query: ({ data, file }) => {
        const formData = new FormData();
        if (file) {
          formData.append('avatar', file);
        }
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, value);
          }
        });

        return {
          url: `${entity}/me`,
          method: 'PUT',
          body: formData,
        };
      },
      transformResponse: (response: ApiResponse<UserInfo>) => ({
        data: response.data,
        message: response.message,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled; 
          const state = getState() as RootState; 
          const accessToken = state.auth.token?.accessToken || '';
          const refreshToken = state.auth.token?.refreshToken || '';

          dispatch(
            setUser({
              accessToken,
              refreshToken,
              user: data.data, 
            })
          );
        } catch (error) {
          console.error('Update user failed:', error);
        }
      },
    }),
  }),
});
export const { useGetMeQuery, useUpdateUserMutation } = userServices;