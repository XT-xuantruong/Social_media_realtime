import { ReactNode } from "react";
import Header from "@/components/Common/Header";
import SidebarLeft from "@/components/Common/SidebarLeft";

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
      </div>
    </div>
  );
}