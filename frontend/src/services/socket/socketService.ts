import { io, Socket } from 'socket.io-client';
import { Message } from '@/interfaces/chat';

export class SocketService {
  private socket: Socket | null = null;
  private readonly url = 'http://localhost:8099';
  private readonly path = '/chat';
  private connectionStatus:
    | 'connecting'
    | 'connected'
    | 'error'
    | 'disconnected' = 'disconnected';
  private statusCallbacks: Array<
    (status: 'connecting' | 'connected' | 'error' | 'disconnected') => void
  > = [];
  private newMessageCallbacks: Array<(message: Message) => void> = [];

  constructor(private accessToken: string) {}

  onStatusChange(
    callback: (
      status: 'connecting' | 'connected' | 'error' | 'disconnected'
    ) => void
  ) {
    this.statusCallbacks.push(callback);
  }

  private notifyStatusChange() {
    this.statusCallbacks.forEach((callback) => callback(this.connectionStatus));
  }

  connect() {
    if (!this.accessToken) {
      console.error('SocketService: No access token');
      this.connectionStatus = 'error';
      this.notifyStatusChange();
      return;
    }

    if (this.socket?.connected) {
      return;
    }

    this.connectionStatus = 'connecting';
    this.notifyStatusChange();
    this.socket = io(this.url, {
      path: this.path,
      auth: { token: `Bearer ${this.accessToken}` },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.connectionStatus = 'connected';
      console.log('SocketService: Connected');
      this.notifyStatusChange();
    });

    this.socket.on('connect_error', (err) => {
      this.connectionStatus = 'error';
      console.error('SocketService: Connection error:', err.message);
      this.notifyStatusChange();
    });

    this.socket.on('disconnect', (reason) => {
      this.connectionStatus = 'disconnected';
      console.log('SocketService: Disconnected:', reason);
      this.notifyStatusChange();
    });

    // Đăng ký sự kiện newMessage chỉ một lần
    this.socket.on('newMessage', (message: Message) => {
      console.log('SocketService: New message received:', message);
      this.newMessageCallbacks.forEach((callback) => callback(message));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = 'disconnected';
      this.notifyStatusChange();
    }
  }

  joinRoom(roomId: string) {
    if (this.socket?.connected) {
      this.socket.emit('joinRoom', { room_id: roomId });
    }
  }

  sendMessage(roomId: string, content: string, image?: string) {
    if (this.socket?.connected) {
      this.socket.emit('sendMessage', { room_id: roomId, content, image });
    }
  }

  onNewMessage(callback: (message: Message) => void) {
    this.newMessageCallbacks.push(callback);
  }

  offNewMessage(callback: (message: Message) => void) {
    this.newMessageCallbacks = this.newMessageCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}
