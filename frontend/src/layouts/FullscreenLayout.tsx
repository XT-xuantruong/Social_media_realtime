import Header from "@/components/Common/Header";
import { ReactNode } from "react";

export default function FullscreenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
        <main className="mt-16 p-4">
          <div className="mx-auto w-full">{children}</div>
        </main>
    </div>
  );
}