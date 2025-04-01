import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserIcon, BellIcon, MessageCircleIcon, SearchIcon } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-md z-20 fixed top-0 left-0 right-0 h-20">
      <div className="mx-auto px-5 py-3 flex items-center justify-between">
        <Link to="/" className="text-3xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
          Social Media
        </Link>
        <div className="relative flex-1 max-w-lg mx-4">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500" />
          <Input
            type="text"
            placeholder="Tìm kiếm trên Facebook"
            className="w-full h-12 rounded-full bg-gray-100 border-none pl-14 pr-6 text-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 transition-all"
          />
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Profile"
          >
            <UserIcon className="h-9 w-9 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <BellIcon className="h-9 w-9 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Messenger"
          >
            <MessageCircleIcon className="h-9 w-9 text-gray-600" />
          </Button>
        </div>
      </div>
    </header>
  );
}