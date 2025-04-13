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
import { useNotifications } from '@/hooks/useNotifications';
import { useMarkNotificationAsReadMutation } from '@/services/graphql/notificationServicesGQL';
import { formatDateWithTimeSince } from '@/utils/formatDateWithTimeSince';

export default function NotificationDropdown() {
  const { notifications, setNotifications } = useNotifications();
  const [visibleCount, setVisibleCount] = useState(4);
  const [markAsRead] = useMarkNotificationAsReadMutation();

  const unreadCount = notifications.filter(({ unread }) => unread).length;

  const toggleReadStatus = async (id: string) => {
    const isUnread = notifications.find((notif) => notif.id === id)?.unread;
    if (!isUnread) return;

    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, unread: false } : notif,
      ),
    );

    try {
      await markAsRead({ notificationId: id }).unwrap();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, unread: true } : notif,
        ),
      );
    }
  };

  const markAsReadOnClick = (id: string) => {
    if (notifications.find((notif) => notif.id === id)?.unread) {
      toggleReadStatus(id);
    }
  };

  const toggleShowMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibleCount((prev) => (prev === 4 ? notifications.length : 4));
  };

  const visibleNotifications = notifications.slice(0, visibleCount);

  return (
    <DropdownMenu modal={false}>
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

      <DropdownMenuContent
        className="w-80"
        align="end"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} new</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className={visibleCount <= 4 ? 'max-h-[180px]' : 'h-[360px]'}>
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
                    markAsReadOnClick(id);
                  }}
                >
                  <span className="text-sm">{message}</span>
                  <span className="text-xs text-gray-500">
                    {
                      formatDateWithTimeSince(time, {
                        formatType: 'relative',
                        locale: 'vi',
                      })
                    }
                  </span>
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

        {notifications.length > 4 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="w-full text-center text-blue-600 hover:text-blue-700 cursor-pointer"
              onClick={toggleShowMore}
              onSelect={(e) => e.preventDefault()}
            >
              {visibleCount <= 4 ? 'Show more' : 'Show less'}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}