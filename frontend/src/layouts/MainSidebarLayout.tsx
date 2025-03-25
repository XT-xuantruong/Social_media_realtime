import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";

export default function MainSidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 pt-14">
        <SidebarLeft />
        <main className="flex-1 p-4 ml-64 mr-80">{children}</main>
        <SidebarRight />
      </div>
      <Footer />
    </div>
  );
}