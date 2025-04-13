import { RootState, store } from '@/stores';
import { baseRestApi } from './baseRestApi';
import { setCredentials, setUser } from '@/stores/authSlice';
import { UserInfo, UserCredentials } from '@/interfaces/user';

interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  status: string;
}

export const authApi = baseRestApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, UserCredentials>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
            })
          );
          const meResponse = await fetch(`/api/users/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.data.accessToken}`,
            },
          });
          const userInfo = await meResponse.json();
          dispatch(setUser({ user: userInfo }));
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
    register: builder.mutation<AuthResponse, UserCredentials>({
      query: (credentials) => ({
        url: 'auth/register',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser({ user: data.data }));
        } catch (error) {
          console.error('Register failed:', error);
        }
      },
    }),
    refreshToken: builder.mutation<
      {
        refreshToken: string;
        accessToken: string;
      },
      void
    >({
      query: () => ({
        url: 'refresh',
        method: 'POST',
        body: {
          refreshToken: (store.getState() as RootState).auth.token
            ?.refreshToken,
        },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            })
          );
        } catch (error) {
          console.error('Refresh token failed:', error);
        }
      },
    }),
    getMe: builder.query<UserInfo, void>({
      query: () => ({
        url: 'users/me',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
} = authApi;
