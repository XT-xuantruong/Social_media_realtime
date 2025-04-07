import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Send, X } from "lucide-react";
import { Friend, Message } from "@/interfaces/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChatWindowProps {
  user: Friend;
  index?: number;
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  user,
  index = 0,
  messages,
  setMessages,
  onClose,
}) => {
  const [input, setInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!input.trim() && selectedImages.length === 0) return;

    const newMessage: Message = { sender: "me" };
    if (input.trim()) newMessage.content = input.trim();
    if (selectedImages.length > 0) newMessage.images = [...selectedImages];

    setMessages([...messages, newMessage]);
    setInput("");
    setSelectedImages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.ctrlKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      setInput((prev) => prev + "\n");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setSelectedImages((prev) => [...prev, ...newPreviews]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const openImageModal = (image: string) => {
    setSelectedImage(image);
    setIsImageModalOpen(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="fixed bottom-0 w-[336px] bg-white border rounded-t-xl shadow-xl z-50 flex flex-col ml-6"
      style={{ right: `${16 + index * (336 + 16)}px` }}
    >
      <div className="flex items-center justify-between p-3 border-b bg-white rounded-t-xl">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-base font-semibold text-gray-900">{user.name}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-600 hover:bg-gray-200"
          onClick={onClose}
        >
          <span className="text-lg">×</span>
        </Button>
      </div>

      <div className="h-64 overflow-y-auto px-3 py-2 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender !== "me" && (
              <Avatar className="h-6 w-6 mr-2 self-end">
                <AvatarImage src={user.avatar} alt={msg.sender} />
                <AvatarFallback>{msg.sender[0]}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[75%] rounded-xl px-3 py-2 text-sm break-words whitespace-pre-wrap ${
                msg.sender === "me"
                  ? "bg-[#0084ff] text-white"
                  : "bg-[#e4e6eb] text-gray-900"
              }`}
            >
              {msg.content && <div>{msg.content}</div>}
              {msg.images && msg.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.images.map((img, imgIdx) => (
                    <img
                      key={imgIdx}
                      src={img}
                      alt={`Image ${imgIdx + 1}`}
                      className="rounded-lg object-cover w-20 h-20 cursor-pointer"
                      onClick={() => openImageModal(img)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 border-t bg-white flex flex-col gap-2">
        {selectedImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedImages.map((preview, index) => (
              <div key={index} className="relative group w-16 h-16">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="rounded-lg object-cover w-full h-full"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3 text-white" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Nhắn tin..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-8 rounded-full border-gray-300 text-sm focus-visible:ring-0 bg-[#f0f2f5]"
          />
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
          <Button variant="ghost" size="icon" className="text-blue-600" onClick={handleSend}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>View Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full h-auto rounded-lg object-contain max-h-[70vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};