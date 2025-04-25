/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer"; // 👈 import thư viện
import { useGetPostsQuery } from "@/services/graphql/postServicesGQL";
import FormCreatePost from "@/components/post/FormCreatePost";
import PostItem from "@/components/post/PostItem";

const Home = () => {
  const [limit] = useState(5);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [allPosts, setAllPosts] = useState<any[]>([]);

  const { data, isLoading, isFetching, refetch } = useGetPostsQuery({ limit, cursor });

  // 👇 tạo ref từ useInView
  const { ref, inView } = useInView({
    threshold: 1.0,
    triggerOnce: false,
  });

  //  callback khi tạo bài viết mới
  const handlePostCreated = async () => {
    setAllPosts([]);
    setCursor(undefined);
    await refetch();
  };

  // cập nhật bài viết mới khi dữ liệu thay đổi
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

  // 👇 infinite scroll: khi inView là true và có nextPage
  useEffect(() => {
    if (inView && data?.pageInfo.hasNextPage && !isFetching) {
      setCursor(data.pageInfo.endCursor);
    }
  }, [inView, data, isFetching]);

  return (
    <div className="max-w-2xl mx-auto py-6">
      <FormCreatePost onPostCreated={handlePostCreated} />

      <div className="mt-6">
        {allPosts.length > 0 ? (
          allPosts.map((edge, index) => {
            const isLast = index === allPosts.length - 1;
            return (
              <div
                key={edge.node.post_id}
                ref={isLast ? ref : null} // 👈 ref vào phần tử cuối
              >
                <PostItem
                  post={edge.node}
                  likeCount={edge.likeCount}
                  commentCount={edge.commentCount}
                />
              </div>
            );
          })
        ) : (
          !isLoading && !isFetching && <p className="text-center text-gray-500">No posts available.</p>
        )}

        {isLoading || isFetching ? (
          <p className="text-center text-gray-500 mt-4">Loading...</p>
        ) : null}
      </div>
    </div>
  );
};

export default Home;
