import { ReactNode } from 'react';
import Header from '@/components/Common/Header';
import SidebarLeft from '@/components/Common/SidebarLeft';

export default function MainSidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="fixed top-16 w-64 bg-white border-r h-[calc(100vh-4rem)]">
          <SidebarLeft />
        </aside>
        <main className="flex-1 mt-16 ml-64 p-4">
          <div className="max-w-4xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}