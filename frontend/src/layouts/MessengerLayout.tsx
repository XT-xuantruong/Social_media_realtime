import { ReactNode } from 'react';
import Header from '@/components/Common/Header';
import ChatSidebar from '@/components/chat/ChatSidebar';

interface MessengerLayoutProps {
  children: ReactNode;
}

export default function MessengerLayout({ children }: MessengerLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 pt-14">
        <ChatSidebar />
        <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)]">{children}</main>
      </div>
    </div>
  );
}