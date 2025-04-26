/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseGraphqlApi } from './baseGraphqlApi';

export const notificationServicesGQL = baseGraphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<any, { limit: number; cursor?: string }>({
      query: ({ limit, cursor }) => ({
        query: `
          query GetNotifications($limit: Int!, $cursor: String) {
            getNotifications(limit: $limit, cursor: $cursor) {
              message
              status
              data {
                edges {
                  node {
                    notification_id
                    type
                    created_at
                    is_read
                    user {
                      id
                      full_name
                      avatar_url
                    }
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
          }
        `,
        variables: { limit, cursor },
      }),
      transformResponse: (response: any) => response.getNotifications,
      providesTags: ['Notifications'],
    }),

    markNotificationAsRead: builder.mutation<any, { notificationId: string }>({
      query: ({ notificationId }) => ({
        query: `
          mutation MarkNotificationAsRead($notificationId: String!) {
            markNotificationAsRead(notificationId: $notificationId) {
              notification_id
              is_read
            }
          }
        `,
        variables: { notificationId },
      }),
      transformResponse: (response: any) => response.markNotificationAsRead,
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkNotificationAsReadMutation } =
  notificationServicesGQL;
