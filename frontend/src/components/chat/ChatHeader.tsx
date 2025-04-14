import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatRoom } from '@/interfaces/chat';

interface ChatHeaderProps {
  room: ChatRoom | null;
}

export default function ChatHeader({ room }: ChatHeaderProps) {
  if (!room) {
    return (
      <div className="bg-white p-3 border-b">
        <span className="text-lg font-semibold text-gray-900">
          Chọn một phòng để chat
        </span>
      </div>
    );
  }

  const displayName = room.is_group
    ? room.name
    : room.roomUsers.find((ru) => ru.user.id !== localStorage.getItem('userId'))
        ?.user.full_name || 'Unknown';

  const avatarUrl = room.is_group
    ? undefined
    : room.roomUsers.find((ru) => ru.user.id !== localStorage.getItem('userId'))
        ?.user.avatar_url;

  return (
    <div className="bg-white p-3 border-b flex items-center">
      <Avatar className="h-8 w-8 mr-2">
        <AvatarImage src={avatarUrl} alt={displayName} />
        <AvatarFallback>{(displayName ?? 'U')[0]}</AvatarFallback>
      </Avatar>
      <span className="text-lg font-semibold text-gray-900">{displayName}</span>
    </div>
  );
}