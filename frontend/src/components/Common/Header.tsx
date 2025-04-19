import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SearchIcon, MessageCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationDropdown from '../NotificationDropdown';
import { UserInfo } from '@/interfaces/user';
import { RootState } from '@/stores';
import { useLogoutMutation } from '@/services/rest_api/AuthServices';
import { FormEvent, useState } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user as UserInfo | null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [logout] = useLogoutMutation()
  const handleOpenMessenger = () => {
    navigate('/messenger');
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout().unwrap();
    navigate('/login');
  };

  const MenuItem = ({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) => (
    <DropdownMenuItem asChild>
      <Link to={to} className="w-full" onClick={onClick}>
        {label}
      </Link>
    </DropdownMenuItem>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-md">
      <div className="mx-auto flex items-center justify-between px-5 py-1">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
          Social Media
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mx-4 max-w-lg flex-1">
          <SearchIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search on Social Media"
            className="h-10 w-full rounded-full border-none bg-gray-100 pl-14 pr-6 text-xl transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <NotificationDropdown />
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Messenger"
            onClick={handleOpenMessenger}
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
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                  <AvatarFallback>{user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-[60]" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <MenuItem to={`/profile/${user?.id || ''}`} label="Profile" />
              <DropdownMenuSeparator />
              <MenuItem to="/login" label="Logout" onClick={handleLogout} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}