import { baseGraphqlApi } from './baseGraphqlApi';
import {
  Message,
  PaginatedChatRoomsResponse,
  PaginatedMessagesResponse,
} from '@/interfaces/chat';

export const chatServicesGQL = baseGraphqlApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatRooms: builder.query<
      PaginatedChatRoomsResponse,
      { limit: number; cursor?: string }
    >({
      query: ({ limit, cursor }) => ({
        query: `
          query GetChatRooms($limit: Int!, $cursor: String) {
            getChatRooms(limit: $limit, cursor: $cursor) {
              edges {
                node {
                  room_id
                  is_group
                  name
                  created_at
                  roomUsers {
                    user {
                      id
                      full_name
                      avatar_url
                    }
                  }
                  messages {
                    message_id
                    content
                    created_at
                    sender {
                      id
                      full_name
                      avatar_url
                    }
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
        `,
        variables: { limit, cursor },
      }),
      transformResponse: (response: {
        getChatRooms: PaginatedChatRoomsResponse;
      }) => response.getChatRooms,
      providesTags: ['ChatRooms'],
    }),

    getMessages: builder.query<
      PaginatedMessagesResponse,
      { roomId: string; limit: number; cursor?: string }
    >({
      query: ({ roomId, limit, cursor }) => ({
        query: `
          query GetMessages($roomId: String!, $limit: Int!, $cursor: String) {
            getMessages(room_id: $roomId, limit: $limit, cursor: $cursor) {
              edges {
                node {
                  message_id
                  content
                  created_at
                  sender {
                    id
                    full_name
                    avatar_url
                  }
                  room {
                    room_id
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
        `,
        variables: { roomId, limit, cursor },
      }),
      transformResponse: (response: {
        getMessages: PaginatedMessagesResponse;
      }) => response.getMessages,
      providesTags: (_result, _error, { roomId }) => [
        { type: 'Messages', id: roomId },
      ],
    }),

    sendMessage: builder.mutation<
      Message,
      { roomId: string; content: string; image?: string }
    >({
      query: ({ roomId, content, image }) => ({
        query: `
          mutation SendMessage($input: SendMessageInput!) {
            sendMessage(input: $input) {
              message
              status
              data {
                message_id
                content
                created_at
                room {
                  room_id
                }
                sender {
                  id
                  full_name
                  avatar_url
                }
              }
            }
          }
        `,
        variables: {
          input: { room_id: roomId, content, image },
        },
      }),
      transformResponse: (response: { sendMessage: { data: Message } }) =>
        response.sendMessage.data,
      invalidatesTags: (_result, _error, { roomId }) => [
        { type: 'Messages', id: roomId },
      ],
    }),
  }),
});

export const {
  useGetChatRoomsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
} = chatServicesGQL;
