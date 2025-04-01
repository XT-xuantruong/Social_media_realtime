import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchIcon, BellIcon, MessageCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  return (
    <header className="bg-white shadow-md z-20 w-full fixed top-0 left-0 right-0">
      <div className="mx-auto px-5 py-1 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
          Social Media
        </Link>
        <div className="relative flex-1 max-w-lg mx-4">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Tìm kiếm trên Facebook"
            className="w-full h-10 rounded-full bg-gray-100 border-none pl-14 pr-6 text-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-14 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <BellIcon className="size-8 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Messenger"
          >
            <MessageCircleIcon className="size-8 text-gray-600" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Profile"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="w-full">
                  Hồ sơ
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="w-full">
                  Cài đặt
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/logout" className="w-full">
                  Đăng xuất
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}