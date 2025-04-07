import { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "react-router-dom";
import { Friend, Message } from "@/interfaces/types";

interface SidebarUserChatProps {
  onSelectUser?: (friend: Friend, messages: Message[]) => void;
  isMessengerPage?: boolean;
}

export default function SidebarUserChat({ onSelectUser, isMessengerPage = false }: SidebarUserChatProps) {
  const [selectedUsers, setSelectedUsers] = useState<Friend[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const location = useLocation();

  const friends: Friend[] = [
    { id: "1", name: "owoanhh", avatar: "https://github.com/shadcn.png" },
    { id: "2", name: "Lộc Nguyễn", avatar: "https://github.com/shadcn.png" },
    { id: "3", name: "Lê Xuân Thống", avatar: "https://github.com/shadcn.png" },
    { id: "4", name: "Nguyễn Văn A", avatar: "https://github.com/shadcn.png" },
  ];

  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({
    "1": [{ sender: "me", content: "Chào bạn!" }],
    "2": [{ sender: "me", content: "Bên đây mấy giờ rồi?" }],
    "3": [
      { sender: "Lê Xuân Thống", content: "k khác gì l" },
      { sender: "me", content: "bên đây mấy h dở bạn" },
      { sender: "Lê Xuân Thống", content: "học có khó hơn bên mình k bạn" },
    ],
    "4": [{ sender: "me", content: "Bạn khỏe không?" }],
  });

  const handleSelectUser = (friend: Friend) => {
    const userMessages = allMessages[friend.id] || [];
    if (isMessengerPage || location.pathname === "/messenger") {
      setSelectedUserId(friend.id);
      if (onSelectUser) onSelectUser(friend, userMessages);
    } else {
      const alreadySelected = selectedUsers.find((u) => u.id === friend.id);
      if (alreadySelected || selectedUsers.length >= 3) return;
      setSelectedUsers((prev) => [...prev, friend]);
      if (onSelectUser) onSelectUser(friend, userMessages);
    }
  };

  const handleCloseUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const filteredFriends = friends.filter(
    (f) => !selectedUsers.some((u) => u.id === f.id)
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tin nhắn</h3>
      <ul className="space-y-2">
        {filteredFriends.map((friend) => (
          <li
            key={friend.id}
            className={`flex items-center p-2 rounded-md transition-colors cursor-pointer ${
              selectedUserId === friend.id ? "bg-gray-100" : "hover:bg-gray-100"
            }`}
            onClick={() => handleSelectUser(friend)}
          >
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={friend.avatar} alt={friend.name} />
              <AvatarFallback>{friend.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <span className="text-base font-medium text-gray-900">{friend.name}</span>
            </div>
          </li>
        ))}
      </ul>

      {!(isMessengerPage || location.pathname === "/messenger") &&
        selectedUsers.map((user, index) => (
          <ChatWindow
            key={user.id}
            user={user}
            index={index}
            messages={allMessages[user.id] || []}
            setMessages={(newMessages) =>
              setAllMessages((prev) => ({ ...prev, [user.id]: newMessages }))
            }
            onClose={() => handleCloseUser(user.id)}
          />
        ))}
    </div>
  );
}