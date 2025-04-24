import { baseRestApi } from './baseRestApi';
import { ApiResponse } from '@/interfaces/apiResponse';
import { ChatRoom, ChatRoomRequest } from '@/interfaces/chat';

const entity = 'chat';

export const chatSerrvices = baseRestApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tạo bài đăng
    createRoom: builder.mutation<
      { data: ChatRoom; message: string; status: number },
      { data: ChatRoomRequest }
    >({
      query: ({ data }) => ({
        url: `${entity}/room`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<ChatRoom>) => ({
        data: response.data,
        message: response.message,
        status: response.status,
      }),
    }),
  }),
});

export const { useCreateRoomMutation } = chatSerrvices;
