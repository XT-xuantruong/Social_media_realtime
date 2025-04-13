import { useState, useRef, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '@/stores';
import { useSendMessageMutation } from '@/services/graphql/chatServicesGQL';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Image } from 'lucide-react';
import ImagePreview from './ImagePreview';
import EmojiPicker from './EmojiPicker';
import { ChatRoom } from '@/interfaces/chat';
import { useSocket } from '@/contexts/SocketContext';

interface ChatInputProps {
  room: ChatRoom;
}

export default function ChatInput({ room }: ChatInputProps) {
  // const dispatch = useDispatch<AppDispatch>();
  // const userId = useSelector((state: RootState) => state.auth.user?.id);
  const { socketService, connectionStatus } = useSocket();
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false); // Thêm trạng thái đang gửi
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sendMessage] = useSendMessageMutation();

  useEffect(() => {
    console.log('ChatInput Connection Status:', connectionStatus);
  }, [connectionStatus]);

  const handleSend = async () => {
    if (!input.trim() && !selectedImages.length) return;
    if (!socketService || connectionStatus !== 'connected') return;

    setIsSending(true); // Đặt trạng thái đang gửi

    try {
      const response = await sendMessage({ roomId: room.room_id, content: input.trim() }).unwrap();
      console.log('Message sent to server:', response);
      setInput('');
      setSelectedImages([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('ChatInput: Failed to send message:', error);
    } finally {
      setIsSending(false); // Kết thúc trạng thái đang gửi
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji);
  };

  return (
    <div className="p-4 bg-white border-t flex flex-col gap-2">
      <ImagePreview images={selectedImages} onRemove={handleRemoveImage} />
      <div className="flex items-center gap-2">
        <Input
          placeholder={isSending ? 'Đang gửi...' : 'Nhắn tin...'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 h-10 rounded-full bg-[#f0f2f5] border-none text-sm focus-visible:ring-0"
          disabled={connectionStatus !== 'connected' || isSending}
        />
        <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        <label className="cursor-pointer">
          <Image className="h-5 w-5 text-gray-600" />
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
        </label>
        <Button
          variant="ghost"
          size="icon"
          className="text-blue-600"
          onClick={handleSend}
          disabled={connectionStatus !== 'connected' || isSending}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}