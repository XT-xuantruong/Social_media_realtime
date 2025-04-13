/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/stores';
import { setSelectedRoom, setMessages, addMessage } from '@/stores/chatSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useGetChatRoomsQuery } from '@/services/graphql/chatServicesGQL';
import { Message, ChatRoom } from '@/interfaces/chat';
import { io, Socket } from 'socket.io-client';

export default function SidebarUserChat() {
  const dispatch = useDispatch<AppDispatch>();
  const selectedRoom = useSelector((state: RootState) => state.chat.selectedRoom);
  const [searchParams, setSearchParams] = useSearchParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'error' | 'disconnected'
  >('connecting');
  const { accessToken = '' } = useSelector(
    (state: RootState) => state.auth.token ?? { accessToken: '' }
  );

  const { data, isLoading, error } = useGetChatRoomsQuery({
    limit: 10,
    cursor: undefined,
  });
  console.log("data: ",data);
  

  useEffect(() => {
    
    if (!accessToken) {
      console.error('No access token found');
      setConnectionStatus('error');
      return;
    }

    const newSocket = io('http://localhost:8099', {
      path: '/chat',
      auth: { token: `Bearer ${accessToken}` },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setConnectionStatus('connected');
    });

    newSocket.on('newMessage', (message: Message) => {
      console.log('Received new message:', message);
      dispatch(
        addMessage({
          roomId: message.room.room_id,
          message,
        }),
      );
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnectionStatus('error');
    });

    newSocket.on('error', ({ message }) => {
      console.error('Socket server error:', message);
      setConnectionStatus('error');
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Reconnection failed after 5 attempts');
      setConnectionStatus('disconnected');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from chat server:', reason);
      setConnectionStatus('disconnected');
    });

    setSocket(newSocket);

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, [dispatch]);

  const handleSelectRoom = (room: ChatRoom) => {
    if (!socket || connectionStatus !== 'connected') {
      console.warn('Cannot select room: Socket not connected. Status:', connectionStatus);
      return;
    }
    console.log('Selecting room:', room.room_id);
    socket.emit('joinRoom', { room_id: room.room_id });
    dispatch(setSelectedRoom(room));
    setSearchParams({ room: room.room_id }); // Update URL
    // Initialize messages for the room if not already present
    dispatch(setMessages({ roomId: room.room_id, messages: [] }));
  };

  if (isLoading) return <p>Loading rooms...</p>;
  if (error) return <p>Error loading rooms: {(error as any).message}</p>;
  if (connectionStatus === 'error')
    return <p>Failed to connect to chat server. Please try again later.</p>;
  if (connectionStatus === 'disconnected')
    return (
      <div>
        <p>Disconnected from chat server.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );

  const rooms: ChatRoom[] = data?.edges?.map((edge) => edge.node) || [];
  console.log("rooms ", rooms);
  

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tin nhắn</h3>
      {connectionStatus === 'connecting' && <p>Connecting to chat server...</p>}
      <ul className="space-y-2">
        {rooms.map((room) => {
          const displayName = room.is_group
            ? room.name
            : room.roomUsers.find(
                (ru) => ru.user.id !== localStorage.getItem('userId'),
              )?.user.full_name || 'Unknown';

          const avatarUrl = room.is_group
            ? undefined
            : room.roomUsers.find(
                (ru) => ru.user.id !== localStorage.getItem('userId'),
              )?.user.avatar_url;

          return (
            <li
              key={room.room_id}
              className={`flex items-center p-2 rounded-md transition-colors cursor-pointer ${
                selectedRoom?.room_id === room.room_id
                  ? 'bg-gray-100'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => handleSelectRoom(room)}
            >
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>{(displayName ?? 'U')[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <span className="text-base font-medium text-gray-900">
                  {displayName}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}