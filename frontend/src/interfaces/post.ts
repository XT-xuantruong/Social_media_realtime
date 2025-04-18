/* eslint-disable @typescript-eslint/no-explicit-any */

import { PostComment } from './comment';
import { PageInfo } from './pageInfo';

export interface Post {
  post_id: string;
  user: { id: string; full_name: string; avatar_url?: string };
  content: string;
  media_url?: string[];
  isLike: boolean;
  created_at: string;
  updated_at?: string;
  visibility: 'public' | 'friends' | 'private';
  likes?: any[];
  comments?: PostComment[];
  likeCount: number;
  commentCount: number;
}

export interface PostEdge {
  node: Post;
  cursor: string;
  likeCount: number;
  commentCount: number;
}

export interface PaginatedResponse {
  edges: PostEdge[];
  pageInfo: PageInfo;
}
