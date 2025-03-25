import { ReactNode } from "react";

export default function FullscreenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 max-w-3xl w-full">{children}</div>
    </div>
  );
}