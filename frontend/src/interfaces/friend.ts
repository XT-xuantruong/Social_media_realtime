// @/interfaces/friend.ts

export interface FriendRequest<T> {
  friendshipId: string;
  user: T;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
  }