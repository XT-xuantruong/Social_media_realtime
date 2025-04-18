/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGetPostsQuery } from '@/services/graphql/postServicesGQL'
import FormCreatePost from '@/components/FormCreatePost';
import PostItem from '@/components/PostItem';


const Home = () => {
  const [limit] = useState(5);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<any[]>([]);

  const { data, isLoading, isFetching } = useGetPostsQuery({ limit, cursor });

  useEffect(() => {
    if (data?.edges && data.edges.length > 0) {
      setAllPosts((prev) => {
        const newPosts = data.edges.filter(
          (edge) => !prev.some((post) => post.node.post_id === edge.node.post_id)
        );
        return [...prev, ...newPosts];
      });
    }
  }, [data,cursor]);

  const handleLoadMore = () => {
    if (data?.pageInfo.hasNextPage) {
      setCursor(data.pageInfo.endCursor);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <FormCreatePost />

      <div className="mt-6">

        {allPosts.length > 0 ? (
          allPosts.map((edge) => (
            <PostItem 
              key={edge.node.post_id} 
              post={edge.node} 
              likeCount={edge.likeCount} 
              commentCount={edge.commentCount} 
            />
          ))
        ) : (
          !isLoading && !isFetching && <p className="text-center text-gray-500">No posts available.</p>
        )}

        {isLoading || isFetching ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          data?.pageInfo.hasNextPage && (
            <div className="text-center mt-4">
              <Button onClick={handleLoadMore} disabled={isFetching}>
                Load More
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;