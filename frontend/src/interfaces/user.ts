export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  privacy: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCredentials {
  full_name?: string;
  email: string;
  password: string;
}
