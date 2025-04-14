import { baseGraphqlApi } from './baseGraphqlApi';
import { FriendRequest, PaginatedResponse } from '@/interfaces/friend';
import { UserInfo } from '@/interfaces/user';

interface FriendshipResponse {
  friendshipId:string;
  status: string;
  created_at: string;
}

export const friendServicesGQL = baseGraphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    // Lấy danh sách bạn bè
    getFriends: builder.query<
      PaginatedResponse<UserInfo>,
      { limit?: number; offset?: number; currentUserId: string }
    >({
      query: ({ limit, offset, currentUserId }) => ({
        query: `
          query GetFriends($limit: Int, $offset: Int, $currentUserId: String!) {
            getFriends(limit: $limit, offset: $offset, currentUserId: $currentUserId) {
              items {
                id
                full_name
                avatar_url
                email
                bio
                friend_status
                friendshipId
                friendId
              }
              total
            }
          }
        `,
        variables: { limit, offset, currentUserId },
      }),
      transformResponse: (response: { getFriends: PaginatedResponse<UserInfo> }) =>
        response.getFriends,
    }),

    getFriendRequests: builder.query<
      PaginatedResponse<FriendRequest<UserInfo>>,
      { limit?: number; offset?: number; currentUserId: string }
    >({
      query: ({ limit, offset, currentUserId }) => ({
        query: `
          query GetFriendRequests($limit: Int, $offset: Int, $currentUserId: String!) {
            getFriendRequests(limit: $limit, offset: $offset, currentUserId: $currentUserId) {
              items {
               friendshipId
               status
               createdAt
               user {
                id
                full_name
                avatar_url
                email
                bio
                friend_status
              }
              }
                total
            }
          }
        `,
        variables: { limit, offset, currentUserId },
      }),
      transformResponse: (response: { getFriendRequests: PaginatedResponse<FriendRequest<UserInfo>> }) =>
        response.getFriendRequests,
    }),

    // Gửi yêu cầu kết bạn
    sendFriendRequest: builder.mutation<FriendshipResponse, { friendId: string; currentUserId: string }>({
      query: ({ friendId, currentUserId }) => ({
        query: `
          mutation SendFriendRequest($friendId: String!, $currentUserId: String!) {
            sendFriendRequest(friendId: $friendId, currentUserId: $currentUserId) {
            friendshipId
              status
              createdAt
            }
          }
        `,
        variables: { friendId, currentUserId },
      }),
      transformResponse: (response: { sendFriendRequest: FriendshipResponse }) =>
        response.sendFriendRequest,
      invalidatesTags: [{ type: 'FriendRequests', id: 'LIST' }],
    }),

    // Chấp nhận yêu cầu kết bạn
    acceptFriendRequest: builder.mutation<FriendshipResponse, { friendshipId: string; currentUserId: string }>({
      query: ({ friendshipId, currentUserId }) => ({
        query: `
          mutation AcceptFriendRequest($friendshipId: String!, $currentUserId: String!) {
            acceptFriendRequest(friendshipId: $friendshipId, currentUserId: $currentUserId) {
            friendshipId
              status
              createdAt
            }
          }
        `,
        variables: { friendshipId, currentUserId },
      }),
      transformResponse: (response: { acceptFriendRequest: FriendshipResponse }) =>
        response.acceptFriendRequest,
      invalidatesTags: [
        { type: 'FriendRequests', id: 'LIST' },
        { type: 'Friends', id: 'LIST' },
      ],
    }),

    // Từ chối yêu cầu kết bạn
    rejectFriendRequest: builder.mutation<boolean, { friendshipId: string; currentUserId: string }>({
      query: ({ friendshipId, currentUserId }) => ({
        query: `
          mutation RejectFriendRequest($friendshipId: String!, $currentUserId: String!) {
            rejectFriendRequest(friendshipId: $friendshipId, currentUserId: $currentUserId)
          }
        `,
        variables: { friendshipId, currentUserId },
      }),
      transformResponse: (response: { rejectFriendRequest: boolean }) =>
        response.rejectFriendRequest,
      invalidatesTags: [{ type: 'FriendRequests', id: 'LIST' }],
    }),

    // Hủy kết bạn
    unfriend: builder.mutation<boolean, { friendshipId: string; currentUserId: string }>({
      query: ({ friendshipId, currentUserId }) => ({
        query: `
          mutation RemoveFriend($friendshipId: String!, $currentUserId: String!) {
            removeFriend(friendshipId: $friendshipId, currentUserId: $currentUserId)
          }
        `,
        variables: { friendshipId, currentUserId },
      }),
      transformResponse: (response: { removeFriend: boolean }) =>
        response.removeFriend,
      invalidatesTags: [{ type: 'Friends', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetFriendsQuery,
  useGetFriendRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useUnfriendMutation,
} = friendServicesGQL;