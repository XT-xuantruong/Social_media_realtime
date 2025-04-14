export interface UserInfo {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  privacy: string;
  friend_status: string;
  friendshipId: string;
  friendId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCredentials {
  full_name?: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  privacy?: 'public' | 'private' | 'friends';
}
