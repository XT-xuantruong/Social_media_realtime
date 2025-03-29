/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/baseGraphqlApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import { RootState } from "@/stores";
import { logout, setCredentials } from "@/stores/authSlice";

const GRAPHQL_URL =
  "https://ecommerceapi-production-e4cc.up.railway.app/graphql";
const REST_URL = "https://ecommerceapi-production-e4cc.up.railway.app/";

interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

const graphqlBaseQuery =
  (): BaseQueryFn<GraphQLRequest, unknown, { status: number; data: any }> =>
  async ({ query, variables }, { getState }) => {
    const state = getState() as RootState;
    const accessToken = state.auth.token?.accessToken;

    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();

      if (result.errors) {
        return { error: { status: response.status, data: result.errors } };
      }

      return { data: result.data };
    } catch (error) {
      return { error: { status: 500, data: error } };
    }
  };

const graphqlBaseQueryWithReauth: BaseQueryFn = async (
  args,
  api,
  extraOptions
) => {
  let result = await graphqlBaseQuery()(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.token?.refreshToken;
    if (refreshToken) {
      const refreshResult = await fetch(`${REST_URL}refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      const refreshData = await refreshResult.json();

      if (refreshData.accessToken) {
        api.dispatch(
          setCredentials({
            accessToken: refreshData.accessToken,
            refreshToken: refreshData.refreshToken,
          })
        );
        result = await graphqlBaseQuery()(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseGraphqlApi = createApi({
  reducerPath: "graphqlApi",
  baseQuery: graphqlBaseQueryWithReauth,
  tagTypes: ["ProductsGraphQL"],
  endpoints: () => ({}),
});
