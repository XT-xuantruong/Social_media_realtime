/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores';
import { useGetNotificationsQuery } from '@/services/graphql/notificationServicesGQL';

interface Notification {
  id: string;
  message: string;
  time: string;
  unread: boolean;
  type?: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { accessToken = '' } = useSelector(
    (state: RootState) => state.auth.token ?? { accessToken: '' }
  );
  const { data, error, refetch } = useGetNotificationsQuery({ limit: 10 });

  // Tải thông báo ban đầu
  useEffect(() => {
    if (data) {
      const mappedNotifications = data.data.edges.map((edge: any) => {
        const node = edge.node;
        // Tạo message động dựa trên type và user
        let message = '';
        switch (node.type) {
          case 'like':
            message = `${node.user.full_name} liked your post.`;
            break;
          case 'comment':
            message = `${node.user.full_name} commented on your post.`;
            break;
          case 'friend_request':
            message = `${node.user.full_name} would like to add you as a friend.`;
            break;
          default:
            message = `New notification from ${node.user.full_name}`;
        }

        return {
          id: node.notification_id,
          message,
          time: node.created_at,
          unread: !node.is_read,
          type: node.type,
          user: {
            id: node.user.id,
            full_name: node.user.full_name,
            avatar_url: node.user.avatar_url,
          },
        };
      });
      setNotifications(mappedNotifications);
    }
    if (error) {
      console.error(
        'Error fetching notifications:',
        JSON.stringify(error, null, 2)
      );
    }
  }, [data, error]);

  // Kết nối WebSocket
  useEffect(() => {
    if (!accessToken) {
      console.warn('No access token available, skipping WebSocket connection');
      return;
    }

    // Khởi tạo socket
    socketRef.current = io('http://127.0.0.1:8099', {
      path: '/notification', // Đảm bảo khớp với backend
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    socket.on('newNotification', (notification: any) => {
      console.log('Received new notification:', notification); // Debug
      // Ánh xạ notification từ WebSocket
      const mappedNotification: Notification = {
        id: notification.notification_id || notification.id,
        message:
          notification.type === 'like'
            ? `${notification.user?.full_name || 'Someone'} liked your post`
            : notification.type === 'comment'
              ? `${notification.user?.full_name || 'Someone'} commented on your post`
              : notification.message || 'New notification',
        time: notification.created_at || new Date().toISOString(),
        unread: !notification.is_read,
        type: notification.type,
        user: notification.user
          ? {
              id: notification.user.id,
              full_name: notification.user.full_name,
              avatar_url: notification.user.avatar_url,
            }
          : undefined,
      };
      setNotifications((prev) => [mappedNotification, ...prev]);
      refetch(); // Đồng bộ với GraphQL
    });

    socket.on('error', (error: any) => {
      console.error('WebSocket error:', error.message);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connect error:', error);
    });

    // Cleanup
    return () => {
      socket.off('newNotification');
      socket.off('error');
      socket.off('connect_error');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken]);

  return { notifications, setNotifications };
};
