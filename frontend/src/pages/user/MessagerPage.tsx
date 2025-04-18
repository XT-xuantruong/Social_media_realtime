/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/stores';
import { addMessage, prependMessages } from '@/stores/chatSlice';
import { useGetMessagesQuery } from '@/services/graphql/chatServicesGQL';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { useSocket } from '@/contexts/SocketContext';
import { Message } from '@/interfaces/chat';

export default function MessengerPage() {
  const dispatch = useDispatch<AppDispatch>();
  const selectedRoom = useSelector((state: RootState) => state.chat.selectedRoom);
  const { socketService, connectionStatus } = useSocket();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { data, isLoading, error } = useGetMessagesQuery(
    {
      roomId: selectedRoom?.room_id || '',
      limit: 20,
      cursor,
    },
    { skip: !selectedRoom },
  );

  useEffect(() => {
    if (selectedRoom && socketService) {
      socketService.joinRoom(selectedRoom.room_id);
      console.log('Joined room:', selectedRoom.room_id);

      const handleNewMessage = (message: Message) => {
        console.log('Received new message:', message);
        dispatch(
          addMessage({
            roomId: message.room.room_id,
            message,
          }),
        );
      };

      socketService.onNewMessage(handleNewMessage);

      return () => {
        socketService?.socket?.off('newMessage', handleNewMessage);
        console.log('Cleaned up newMessage listener for room:', selectedRoom.room_id);
      };
    }
  }, [selectedRoom, socketService, dispatch]);

  useEffect(() => {
    if (data?.edges && !cursor) {
      const messages = data.edges.map((edge) => edge.node);
      console.log('Messages to prepend:', messages);
      dispatch(
        prependMessages({
          roomId: selectedRoom!.room_id,
          messages,
        }),
      );
    }
  }, [data, cursor, selectedRoom, dispatch]);

  useEffect(() => {
    if (isFetchingMore && data?.edges) {
      const newMessages = data.edges.map((edge) => edge.node);
      console.log('Fetched more messages:', newMessages);
      dispatch(
        prependMessages({
          roomId: selectedRoom!.room_id,
          messages: newMessages,
        }),
      );
      setIsFetchingMore(false);
    }
  }, [data, isFetchingMore, selectedRoom, dispatch]);

  const messages = useSelector(
    (state: RootState) => state.chat.allMessages[selectedRoom?.room_id || ''] || [],
  );

  return (
    <div className="flex flex-col h-full">
      <ChatHeader room={selectedRoom} />
      {selectedRoom ? (
        connectionStatus === 'error' ? (
          <p className="text-red-500 text-center">
            Không thể kết nối đến server chat.
          </p>
        ) : connectionStatus === 'disconnected' ? (
          <p className="text-gray-600 text-center">
            Đã ngắt kết nối. Vui lòng thử lại.
          </p>
        ) : connectionStatus === 'connecting' ? (
          <p className="text-gray-600 text-center">
            Đang kết nối đến server chat... Vui lòng chờ.
          </p>
        ) : error ? (
          <p className="text-red-500 text-center">
            Lỗi khi tải tin nhắn: {(error as any).message}
          </p>
        ) : (
          <>
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              isFetchingMore={isFetchingMore}
              onLoadMore={() => {
                if (data?.pageInfo.hasNextPage && data?.pageInfo.endCursor && !isFetchingMore) {
                  console.log('Loading more messages with cursor:', data.pageInfo.endCursor);
                  setIsFetchingMore(true);
                  setCursor(data.pageInfo.endCursor);
                }
              }}
            />
            <ChatInput room={selectedRoom} />
          </>
        )
      ) : (
        <p className="text-sm text-gray-600 text-center">
          Chọn một phòng để bắt đầu chat!
        </p>
      )}
    </div>
  );
}