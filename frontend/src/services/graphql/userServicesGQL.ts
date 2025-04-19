import { PaginatedResponse } from '@/interfaces/user';
import { baseGraphqlApi } from './baseGraphqlApi';

export const userServicesGQL = baseGraphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query<
      PaginatedResponse,
      { query: string; limit: number; cursor?: string }
    >({
      query: ({ query, limit, cursor }) => ({
        query: `
          query searchUsers($query: String!, $limit: Int!, $cursor: String) {
            searchUsers(query: $query, limit: $limit, cursor: $cursor) {
              message
              status
              edges {
                node {
                    id
                    email
                    full_name
                    avatar_url
                    bio
                    privacy
                    created_at
                }
                cursor
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
      transformResponse: (response: { searchUsers: PaginatedResponse }) =>
        response.searchUsers,
    }),
  }),
});

export const { useSearchUsersQuery } = userServicesGQL;
