import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon, MessageCircleIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationDropdown from './NotificationDropdown';

export default function Header() {
  return (
    <header className="bg-white shadow-md z-20 w-full fixed top-0 left-0 right-0">
      <div className="mx-auto px-5 py-1 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Social Media
        </Link>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg mx-4">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 size-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search on Social Media"
            className="w-full h-10 rounded-full bg-gray-100 border-none pl-14 pr-6 text-xl focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 transition-all"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <NotificationDropdown />
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
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="User avatar"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="w-full">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="w-full">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/logout" className="w-full">
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}