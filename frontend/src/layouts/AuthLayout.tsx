import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster"
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className=" min-h-screen flex items-center justify-center ">
      <Toaster />
      {children}
    </div>
  );
}