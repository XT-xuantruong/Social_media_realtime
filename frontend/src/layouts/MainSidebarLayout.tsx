import { ReactNode } from "react";
import Header from "@/components/Header";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarUserChat from "@/components/SidebarUserChat";

export default function MainSidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 pt-20">
        <div className="w-64 bg-white border-r">
          <SidebarLeft />
        </div>
        <main className="flex-1 flex justify-center items-start p-4">
          <div className="max-w-4xl w-full">{children}</div>
        </main>
        <div className="w-80 bg-white p-4 border-l">
          <SidebarUserChat isMessengerPage={false} />
        </div>
      </div>
    </div>
  );
}