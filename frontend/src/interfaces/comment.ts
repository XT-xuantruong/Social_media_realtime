import { Post } from './post';

export interface PostComment {
  comment_id: string;
  user?: { id: string; full_name: string; avatar_url?: string };
  post: Post;
  content: string;
  created_at: string;
}
