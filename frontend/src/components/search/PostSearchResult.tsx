/* eslint-disable @typescript-eslint/no-explicit-any */
import PostItem from '../post/PostItem';
import { FileText } from 'lucide-react';

interface PostSearchResultProps {
  posts: any[];
}

export default function PostSearchResult({ posts }: PostSearchResultProps) {
  
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <FileText className="size-5 mr-2" /> Posts ({posts.length})
      </h2>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts found.</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post: any, index) => (
            <PostItem
              key={index}
              post={post?.node}
              likeCount={post.likeCount || 0}
              commentCount={post.commentCount || post.comments?.length || 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}