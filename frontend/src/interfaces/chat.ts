import { PageInfo } from './pageInfo';

export interface ChatRoom {
  room_id: string;
  is_group: boolean;
  name?: string;
  created_at: string;
  roomUsers: { user: { id: string; full_name: string; avatar_url: string } }[];
  messages?: Message[];
}

export interface ChatRoomRequest {
  is_group?: boolean;
  name?: string;
  user_ids: string[];
}

export interface ChatRoomUser {
  room_user_id: string;
  user: { id: string; full_name: string; avatar_url: string };
  room: ChatRoom;
}

export interface Message {
  message_id: string;
  content?: string;
  created_at: string;
  sender: { id: string; full_name: string; avatar_url: string };
  room: { room_id: string };
}

export interface ChatRoomEdge {
  node: ChatRoom;
  cursor: string;
}

export interface MessageEdge {
  node: Message;
  cursor: string;
}

export interface PaginatedChatRoomsResponse {
  edges: ChatRoomEdge[];
  pageInfo: PageInfo;
}

export interface PaginatedMessagesResponse {
  edges: MessageEdge[];
  pageInfo: PageInfo;
}
