import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores';
import { SocketService } from '@/services/socket/socketService';

interface SocketContextType {
  socketService: SocketService | null;
  connectionStatus: 'connecting' | 'connected' | 'error' | 'disconnected';
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const accessToken = useSelector(
    (state: RootState) => state.auth.token?.accessToken || ''
  );
  const [socketService, setSocketService] = useState<SocketService | null>(
    null
  );
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'error' | 'disconnected'
  >('disconnected');

  useEffect(() => {
    if (accessToken) {
      const service = new SocketService(accessToken);
      service.connect();
      setSocketService(service);
      setConnectionStatus(service.getConnectionStatus());
      console.log(
        'Initial Socket Connection Status:',
        service.getConnectionStatus()
      );

      // Đăng ký callback để cập nhật trạng thái
      const handleStatusChange = (
        status: 'connecting' | 'connected' | 'error' | 'disconnected'
      ) => {
        setConnectionStatus(status);
        console.log('Socket Connection Status Updated:', status);
      };
      service.onStatusChange(handleStatusChange);

      return () => {
        service.disconnect();
        setSocketService(null);
        setConnectionStatus('disconnected');
      };
    }
  }, [accessToken]);

  return (
    <SocketContext.Provider value={{ socketService, connectionStatus }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
