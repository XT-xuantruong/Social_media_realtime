import { ReactNode } from "react";
import Header from "@/components/Header";

export default function MessengerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 pt-14">
        <div className="w-80 bg-white p-4 border-r">
          <h3 className="font-semibold mb-4">Tin nhắn</h3>
          <ul className="space-y-2">
            <li className="p-2 hover:bg-gray-100 rounded">Cuộc trò chuyện 1</li>
            <li className="p-2 hover:bg-gray-100 rounded">Cuộc trò chuyện 2</li>
          </ul>
        </div>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}