/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import FormCreatePost from '@/components/post/FormCreatePost';
import PostItem from '@/components/post/PostItem';
import { useGetMyPostsQuery } from '@/services/graphql/postServicesGQL';
import { RootState } from '@/stores';
import { useSelector } from 'react-redux';

interface PostsSectionProps {
  userId: string;
}
export const PostsSection = ({ userId }: PostsSectionProps) => {
  const [limit] = useState(5);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const { data, isLoading, isFetching, refetch } = useGetMyPostsQuery({ limit, cursor, userId });
  const me = useSelector((state: RootState) => state.auth.user);

  const { ref: inViewRef, inView } = useInView({
    threshold: 1.0,
    triggerOnce: false,
  });

  const handlePostCreated = async () => {
    setAllPosts([]);
    setCursor(undefined);
    await refetch();
  };

  useEffect(() => {
    if (data?.edges && data.edges.length > 0) {
      setAllPosts((prev) => {
        const newPosts = data.edges.filter(
          (edge) => !prev.some((post) => post.node.post_id === edge.node.post_id)
        );
        return [...prev, ...newPosts];
      });
    }
  }, [data, cursor]);

  useEffect(() => {
    if (inView && data?.pageInfo.hasNextPage && !isFetching) {
      setCursor(data.pageInfo.endCursor);
    }
  }, [inView, data, isFetching]);

  return (
    <div>
      {
        me?.id === userId && 
        <FormCreatePost onPostCreated={handlePostCreated} />
      }
      <div className="bg-white p-4 rounded-lg border mt-4 shadow">
        <h2 className="text-lg font-semibold mb-4">Posts</h2>
        {allPosts.length > 0 ? (
          allPosts.map((edge, index) => {
            const isLast = index === allPosts.length - 1;
            return (
              <div
                key={edge.node.post_id}
                ref={isLast ? inViewRef : null}
              >
                <PostItem
                  post={edge.node}
                  likeCount={edge.node.likeCount || 0}
                  commentCount={edge.node.comments?.length || 0}
                />
              </div>
            );
          })
        ) : (
          !isLoading && !isFetching && (
            <p className="text-gray-600">No posts available.</p>
          )
        )}
        {isLoading || isFetching ? (
          <p className="text-gray-600 mt-4 text-center">Loading posts...</p>
        ) : null}
      </div>
    </div>
  );
};