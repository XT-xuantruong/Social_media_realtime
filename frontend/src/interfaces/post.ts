/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Post {
  post_id: string;
  user: any;
  content: string;
  media_url?: string;
  created_at: string;
  updated_at?: string;
  visibility: 'public' | 'friends' | 'private';
  likes?: any[];
  comments?: any[];
}
