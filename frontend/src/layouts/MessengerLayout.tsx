import { ReactNode, useState } from "react";
import Header from "@/components/Common/Header";
import SidebarUserChat from "@/components/SidebarUserChat";
import MessengerPage from "@/pages/MessagerPage";
import { Friend, Message } from "@/interfaces/types";

interface MessengerLayoutProps {
  children?: ReactNode;
}

export default function MessengerLayout({ children }: MessengerLayoutProps) {
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>({});

  const handleSelectUser = (friend: Friend, messages: Message[]) => {
    setSelectedUser(friend);
    setAllMessages((prev) => ({ ...prev, [friend.id]: messages }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 pt-14">
        {/* SidebarUserChat bên trái */}
        <div className="w-80 bg-white p-4 border-r">
          <SidebarUserChat onSelectUser={handleSelectUser} isMessengerPage={true} />
        </div>
        {/* MessengerPage bên phải */}
        <main className="flex-1 p-4">
          <MessengerPage
            selectedUser={selectedUser}
            messages={selectedUser ? allMessages[selectedUser.id] || [] : []}
            setMessages={(newMessages) =>
              selectedUser && setAllMessages((prev) => ({ ...prev, [selectedUser.id]: newMessages }))
            }
          />
        </main>
      </div>
    </div>
  );
}