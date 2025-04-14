import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores';
import { Message } from '@/interfaces/chat';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isFetchingMore: boolean;
  onLoadMore: () => void;
}

export default function ChatMessages({
  messages,
  isLoading,
  isFetchingMore,
  onLoadMore,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);

  // Cập nhật danh sách tin nhắn hiển thị
  useEffect(() => {
    setDisplayedMessages(messages);
  }, [messages]);

  // Tự động cuộn xuống tin nhắn mới nhất khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayedMessages]);

  // Xử lý cuộn để tải thêm tin nhắn cũ
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current;
      if (scrollTop === 0 && !isFetchingMore) {
        onLoadMore();
      }
    }
  };

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 flex flex-col"
      onScroll={handleScroll}
    >
      {isLoading && <p className="text-center text-gray-600">Đang tải...</p>}
      {isFetchingMore && (
        <p className="text-center text-gray-600">Đang tải thêm...</p>
      )}
      <div className="flex flex-col gap-3">
        {displayedMessages.map((message) => {
          const isCurrentUser = message.sender.id === currentUserId;
          const displayName = message.sender.full_name || "Unknown";

          return (
            <div
              key={message.message_id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-2">
                {/* Hiển thị avatar bên trái cho người nhận */}
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8 mr-2 self-end">
                    <AvatarImage
                      src={message.sender.avatar_url || 'https://via.placeholder.com/40'}
                      alt={displayName}
                    />
                    <AvatarFallback>{displayName[0]}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs p-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.created_at).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {/* Hiển thị avatar bên phải cho người gửi */}
                {isCurrentUser && (
                  <Avatar className="h-8 w-8 ml-2 self-end">
                    <AvatarImage
                      src={message.sender.avatar_url || 'https://via.placeholder.com/40'}
                      alt={displayName}
                    />
                    <AvatarFallback>{displayName[0]}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}