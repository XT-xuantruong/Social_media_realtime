
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { RootState } from '@/stores';
import { setCredentials, logout } from '@/stores/authSlice';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8099/api/';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const accessToken = state.auth.token?.accessToken;
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.token?.refreshToken;
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: 'auth/refresh',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );
      if (refreshResult.data) {
        const newTokens = refreshResult.data as {
          accessToken: string;
          refreshToken?: string;
        };
        api.dispatch(
          setCredentials({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken ?? refreshToken,
          })
        );
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseRestApi = createApi({

  reducerPath: 'restApi',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
});
