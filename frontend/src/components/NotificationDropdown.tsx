import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BellIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

// Mock data for notifications
const mockNotifications = [
  { id: 1, message: "Nguyen Van A liked your post", time: "5 minutes ago", unread: true },
  { id: 2, message: "Tran Thi B commented on your post", time: "1 hour ago", unread: true },
  { id: 3, message: "You have a new friend request", time: "2 hours ago", unread: false },
  { id: 4, message: "Le Van C shared your post", time: "3 hours ago", unread: true },
  { id: 5, message: "Pham Thi D mentioned you", time: "4 hours ago", unread: false },
  { id: 6, message: "Hoang Van E sent you a message", time: "5 hours ago", unread: true },
  { id: 7, message: "Nguyen Thi F liked your photo", time: "6 hours ago", unread: false },
  { id: 8, message: "Tran Van G added you to a group", time: "7 hours ago", unread: true },
  { id: 9, message: "Le Thi H posted something new", time: "8 hours ago", unread: false },
  { id: 10, message: "Pham Van I replied to your comment", time: "9 hours ago", unread: true },
];

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [visibleCount, setVisibleCount] = useState(4);
  const unreadCount = notifications.filter(({ unread }) => unread).length;

  // Toggle read/unread status of a notification
  const toggleReadStatus = (id: number) =>
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, unread: !notif.unread } : notif
      )
    );

  // Mark a notification as read when clicked
  const markAsRead = (id: number) => {
    if (notifications.find((notif) => notif.id === id)?.unread) {
      toggleReadStatus(id); // Only toggle if the notification is unread
    }
  };

  // Toggle between showing 4 or all notifications
  const toggleShowMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleCount((prev) => (prev === 4 ? notifications.length : 4));
  };

  const visibleNotifications = notifications.slice(0, visibleCount);

  return (
    <DropdownMenu modal={false}>
      {/* Trigger */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-14 rounded-full hover:bg-gray-100 transition-colors relative"
          aria-label="Notifications"
        >
          <BellIcon className="size-8 text-gray-600" />
          {unreadCount > 0 && (
            <Badge
              className="absolute top-1 right-1 h-5 min-w-[1.25rem] px-1"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      {/* Content */}
      <DropdownMenuContent
        className="w-80"
        align="end"
        onCloseAutoFocus={(e) => e.preventDefault()} // Prevent closing when losing focus
      >
        {/* Header */}
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Notifications List */}
        <ScrollArea className={visibleCount <= 4 ? "max-h-[180px]" : "h-[360px]"}>
          {visibleNotifications.length > 0 ? (
            visibleNotifications.map(({ id, message, time, unread }) => (
              <DropdownMenuItem
                key={id}
                className={`flex items-center justify-between p-3 ${
                  unread ? 'bg-blue-50' : ''
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  to={`/notification/${id}`}
                  className="flex flex-col flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(id); 
                  }}
                >
                  <span className="text-sm">{message}</span>
                  <span className="text-xs text-gray-500">{time}</span>
                </Link>
                <Checkbox
                  checked={!unread}
                  onCheckedChange={() => toggleReadStatus(id)}
                  onClick={(e) => e.stopPropagation()}
                  className="ml-2"
                  aria-label={`Mark notification ${id} as read`}
                />
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem className="text-center text-gray-500">
              No notifications
            </DropdownMenuItem>
          )}
        </ScrollArea>

        {/* Show More/Less Button */}
        {notifications.length > 4 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="w-full text-center text-blue-600 hover:text-blue-700 cursor-pointer"
              onClick={toggleShowMore}
              onSelect={(e) => e.preventDefault()}
            >
              {visibleCount <= 4 ? "Show more" : "Show less"}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}