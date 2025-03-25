import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="pt-14">
        <div className="h-64 bg-gray-200 relative">
          {/* Ảnh bìa */}
          <div className="absolute -bottom-16 left-8 w-32 h-32 bg-gray-300 rounded-full"></div> {/* Avatar */}
        </div>
        <div className="max-w-5xl mx-auto px-4 pt-20">
          <div className="flex space-x-4 mb-4">
            <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
              Dòng thời gian
            </button>
            <button className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">
              Bạn bè
            </button>
          </div>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}