/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import UserSearchResult from '@/components/search/UserSearchResult';
import PostSearchResult from '@/components/search/PostSearchResult';
import { useSearchPostsQuery } from '@/services/graphql/postServicesGQL';
import { useSearchUsersQuery } from '@/services/graphql/userServicesGQL';

export default function SearchResult() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';
  const [limit] = useState(5);
  const [postCursor, setPostCursor] = useState<string | undefined>(undefined);
  const [userCursor, setUserCursor] = useState<string | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Gọi API tìm kiếm bài viết
  const {
    data: postData,
    isLoading: postLoading,
    isFetching: postFetching,
    error: postError,
    refetch: refetchPosts,
  } = useSearchPostsQuery({
    query,
    limit,
    cursor: postCursor,
  });

  // Gọi API tìm kiếm người dùng
  const {
    data: userData,
    isLoading: userLoading,
    isFetching: userFetching,
    error: userError,
    refetch: refetchUsers,
  } = useSearchUsersQuery({
    query,
    limit,
    cursor: userCursor,
  });

  // Theo dõi phần tử cuối danh sách để tải thêm dữ liệu
  const { ref: userRef, inView: userInView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
    rootMargin: '200px 0px', // Kích hoạt sớm khi gần đến cuối
  });

  const { ref: postRef, inView: postInView } = useInView({
    threshold: 1.0,
    triggerOnce: false,
  });

  // Xử lý tải thêm dữ liệu khi cuộn
  useEffect(() => {
    if (userInView && !userFetching && userData?.pageInfo.hasNextPage) {
      setUserCursor(userData.pageInfo.endCursor);
    }
  }, [userInView, userData, userFetching]);

  useEffect(() => {
    if (postInView && !postFetching && postData?.pageInfo.hasNextPage) {
      setPostCursor(postData.pageInfo.endCursor);
    }
  }, [postInView, postData, postFetching]);

  // Cập nhật danh sách bài viết khi nhận dữ liệu mới
  useEffect(() => {
    if (postData?.edges) {
      setAllPosts((prev) => [...prev, ...postData.edges]);
    }
  }, [postData]);

  // Cập nhật danh sách người dùng khi nhận dữ liệu mới
  useEffect(() => {
    if (userData?.edges) {
      setAllUsers((prev) => [...prev, ...userData.edges]);
    }
  }, [userData]);

  // Làm mới dữ liệu khi query thay đổi
  useEffect(() => {
    setAllPosts([]);
    setAllUsers([]);
    setPostCursor(undefined);
    setUserCursor(undefined);
    refetchPosts();
    refetchUsers();
  }, [query, refetchPosts, refetchUsers]);

  // Kiểm tra trạng thái tải và lỗi
  const isLoading = postLoading || userLoading;
  const isFetching = postFetching || userFetching;
  const error = postError || userError;

  return (
    <div className="py-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        Search Results for "{query || 'All'}"
      </h1>

      {isLoading && !allPosts.length && !allUsers.length ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          Error loading search results. Please try again.
        </div>
      ) : (
        <>
          <UserSearchResult users={allUsers} userRef={userRef} isFetching={userFetching} hasNextPage={userData?.pageInfo.hasNextPage || false} />
          <PostSearchResult posts={allPosts} />

          {isFetching && !userFetching && (
            <div className="flex justify-center my-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {postData?.pageInfo.hasNextPage && (
            <div ref={postRef} className="h-1" />
          )}

          {!allPosts.length && !allUsers.length && !isLoading && (
            <p className="text-center text-gray-500">
              No results found for "{query}".
            </p>
          )}
        </>
      )}
    </div>
  );
}