import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatRoom, Message } from '@/interfaces/chat';

interface ChatState {
  selectedRoom: ChatRoom | null;
  allMessages: Record<string, Message[]>;
}

const initialState: ChatState = {
  selectedRoom: null,
  allMessages: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      state.selectedRoom = action.payload;
    },
    setMessages: (
      state,
      action: PayloadAction<{ roomId: string; messages: Message[] }>
    ) => {
      state.allMessages[action.payload.roomId] = action.payload.messages;
    },
    addMessage: (
      state,
      action: PayloadAction<{ roomId: string; message: Message }>
    ) => {
      const { roomId, message } = action.payload;
      const messages = state.allMessages[roomId] || [];

      const isDuplicateId = messages.some(
        (msg) => msg.message_id === message.message_id
      );

      const isDuplicateContent = messages.some((msg) => {
        const timeDiff = Math.abs(
          new Date(msg.created_at).getTime() -
            new Date(message.created_at).getTime()
        );
        return (
          msg.content === message.content &&
          msg.sender.id === message.sender.id &&
          timeDiff < 5000
        );
      });

      if (!isDuplicateId && !isDuplicateContent) {
        state.allMessages[roomId] = [...messages, message].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      } else if (
        message.message_id &&
        !message.message_id.startsWith('temp-')
      ) {
        const updatedMessages = messages.map((msg) =>
          msg.message_id.startsWith('temp-') &&
          msg.content === message.content &&
          msg.sender.id === message.sender.id
            ? message
            : msg
        );
        if (
          !updatedMessages.some((msg) => msg.message_id === message.message_id)
        ) {
          state.allMessages[roomId] = [...updatedMessages, message].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
        } else {
          state.allMessages[roomId] = updatedMessages.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
        }
      }
    },
    prependMessages: (
      state,
      action: PayloadAction<{ roomId: string; messages: Message[] }>
    ) => {
      const { roomId, messages } = action.payload;
      const existingMessages = state.allMessages[roomId] || [];
      const newMessages = messages.filter(
        (newMsg) =>
          !existingMessages.some((msg) => msg.message_id === newMsg.message_id)
      );
      state.allMessages[roomId] = [...newMessages, ...existingMessages].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    },
    clearChatState: (state) => {
      state.selectedRoom = null;
      state.allMessages = {};
    },
  },
});

export const {
  setSelectedRoom,
  setMessages,
  addMessage,
  prependMessages,
  clearChatState,
} = chatSlice.actions;
export default chatSlice.reducer;
