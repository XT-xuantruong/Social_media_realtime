/* eslint-disable @typescript-eslint/no-unused-vars */
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/stores';
import { setSelectedRoom } from '@/stores/chatSlice';
import { useGetChatRoomsQuery } from '@/services/graphql/chatServicesGQL';
import { ChatRoom } from '@/interfaces/chat';
import ChatRoomItem from './ChatRoomItem';
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatSidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const selectedRoom = useSelector((state: RootState) => state.chat.selectedRoom);
  const allMessages = useSelector((state: RootState) => state.chat.allMessages);
  const [searchParams, setSearchParams] = useSearchParams();
  const { data, isLoading, error } = useGetChatRoomsQuery({
    limit: 10,
    cursor: undefined,
  });

  const handleSelectRoom = (room: ChatRoom) => {
    dispatch(setSelectedRoom(room));
    setSearchParams({ room: room.room_id });
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-white p-4 border-r h-[calc(100vh-3.5rem)]">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tin nhắn</h3>
        <ul className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <li key={index} className="flex items-center p-2">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <Skeleton className="h-4 w-32" />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-white p-4 border-r h-[calc(100vh-3.5rem)]">
        <p className="text-red-500">Lỗi khi tải phòng chat</p>
      </div>
    );
  }

  const rooms = data?.edges?.map((edge) => edge.node) || [];

  return (
    <div className="w-80 bg-white p-4 border-r h-[calc(100vh-3.5rem)]">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tin nhắn</h3>
      <ul className="space-y-2 h-[calc(100%-4rem)] overflow-y-auto">
        {rooms.map((room) => {
          const messages = allMessages[room.room_id] || [];
          const hasNewMessage = messages.some(
            (msg) => new Date(msg.created_at) > new Date(room.created_at),
          );

          return (
            <ChatRoomItem
              key={room.room_id}
              room={room}
              isSelected={selectedRoom?.room_id === room.room_id}
              hasNewMessage={hasNewMessage}
              onSelect={handleSelectRoom}
            />
          );
        })}
      </ul>
    </div>
  );
}