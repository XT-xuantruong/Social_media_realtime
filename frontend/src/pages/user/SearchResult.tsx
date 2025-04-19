/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import UserSearchResult from '@/components/search/UserSearchResult';
import PostSearchResult from '@/components/search/PostSearchResult';
import { useSearchPostsQuery } from '@/services/graphql/postServicesGQL';

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';
  const [limit] = useState(5);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<any[]>([]);

  const { data, isLoading, isFetching, error, refetch } = useSearchPostsQuery({
    query,
    limit,
    cursor,
  });
  

  const { ref, inView } = useInView({
    threshold: 1.0,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && data?.pageInfo.hasNextPage && !isFetching) {
      setCursor(data.pageInfo.endCursor);
    }
  }, [inView, data, isFetching]);

  useEffect(() => {
    if (data?.edges) {
      setAllPosts((prev) => [...prev, ...data.edges]);
      
    }
  }, [data]);

  useEffect(() => {
    setAllPosts([]);
    setCursor(undefined);
    refetch();
  }, [query, refetch]);

  return (
    <div className="py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        Search Results for "{query || 'All'}"
      </h1>

      {isLoading && !allPosts.length ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          Error loading search results. Please try again.
        </div>
      ) : (
        <>
          <UserSearchResult users={[]} /> 
          
          <PostSearchResult posts={allPosts} />
          
          {isFetching && (
            <div className="flex justify-center my-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {/* Phần tử tham chiếu để kích hoạt tải thêm */}
          {data?.pageInfo.hasNextPage && (
            <div ref={ref} className="h-1" />
          )}

          {/* Thông báo khi không có kết quả */}
          {!allPosts.length && !isLoading && (
            <p className="text-center text-gray-500">
              No results found for "{query}".
            </p>
          )}
        </>
      )}
    </div>
  );
}