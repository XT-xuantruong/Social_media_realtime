import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatRoom } from '@/interfaces/chat';
import { cn } from '@/lib/utils'; // Helper từ ShadCN để merge className

interface ChatRoomItemProps {
  room: ChatRoom;
  isSelected: boolean;
  hasNewMessage: boolean;
  onSelect: (room: ChatRoom) => void;
}

export default function ChatRoomItem({
  room,
  isSelected,
  hasNewMessage,
  onSelect,
}: ChatRoomItemProps) {
  const displayName = room.is_group
    ? room.name
    : room.roomUsers.find((ru) => ru.user.id !== localStorage.getItem('userId'))
        ?.user.full_name || 'Unknown';

  const avatarUrl = room.is_group
    ? undefined
    : room.roomUsers.find((ru) => ru.user.id !== localStorage.getItem('userId'))
        ?.user.avatar_url;

  return (
    <li
      className={cn(
        'flex items-center p-2 rounded-md cursor-pointer transition-colors relative',
        isSelected ? 'bg-gray-100' : 'hover:bg-gray-100',
      )}
      onClick={() => onSelect(room)}
    >
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback>{(displayName ?? 'U')[0]}</AvatarFallback>
      </Avatar>
      <span className="text-base font-medium text-gray-900">{displayName}</span>
      {hasNewMessage && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 bg-blue-500 rounded-full" />
      )}
    </li>
  );
}