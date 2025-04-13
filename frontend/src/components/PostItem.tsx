/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Post } from "@/interfaces/post";
import { Heart, MessageCircle, X } from "lucide-react";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  useCreateCommentMutation, 
  useDeleteCommentMutation, 
  useLikePostMutation, 
  useUnlikePostMutation 
} from "@/services/graphql/postServicesGQL";
import { PostComment } from "@/interfaces/comment";

interface PostItemProps {
  post: Post;
  likeCount: number;
  commentCount: number;
}

export default function PostItem({ post, likeCount, commentCount }: PostItemProps) {
  const [isLiked, setIsLiked] = useState(false); // Giả sử trạng thái like (cần tích hợp với API để kiểm tra)
  const [likeCounts, setLikeCounts] = useState(likeCount);
  
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState<PostComment[]>(post.comments || []);

  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [unlikePost, { isLoading: isUnliking }] = useUnlikePostMutation();
  const [createComment, { isLoading: isCreatingComment }] = useCreateCommentMutation();
  const [deleteComment, { isLoading: isDeletingComment }] = useDeleteCommentMutation();
  const { toast } = useToast();

  const handleLike = async () => {
    try {
      await likePost({ postId: post.post_id }).unwrap();
      setIsLiked(true);
      setLikeCounts((prev) => prev + 1);
      toast({ title: "Success", description: "Post liked!" });
    } catch (error: any) {
      toast({ title: "Error", description: error?.data?.message || "Failed to like post." });
    }
  };

  const handleUnlike = async () => {
    try {
      await unlikePost({ postId: post.post_id }).unwrap();
      setIsLiked(false);
      setLikeCounts((prev) => prev - 1);
      toast({ title: "Success", description: "Post unliked!" });
    } catch (error: any) {
      toast({ title: "Error", description: error?.data?.message || "Failed to unlike post." });
    }
  };

  const handleCreateComment = async () => {
    if (!commentContent.trim()) return;
    try {
      const newComment = await createComment({
        postId: post.post_id,
        content: commentContent,
      }).unwrap();
      setComments((prev) => [...prev, newComment]);
      setCommentContent("");
      toast({ title: "Success", description: "Comment added!" });
    } catch (error: any) {
      toast({ title: "Error", description: error?.data?.message || "Failed to add comment." });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment({ commentId }).unwrap();
      setComments((prev) => prev.filter((comment) => comment.comment_id !== commentId));
      toast({ title: "Success", description: "Comment deleted!" });
    } catch (error: any) {
      toast({ title: "Error", description: error?.data?.message || "Failed to delete comment." });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border mb-4">
      <div className="flex items-center space-x-3 mb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.user.avatar_url || "https://github.com/shadcn.png"} alt={post.user.full_name} />
          <AvatarFallback>{post.user.full_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-gray-800">{post.user.full_name}</p>
          <p className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <p className="text-gray-700 mb-3">{post.content}</p>

      {post.media_url && post.media_url.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {post.media_url.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Post media ${index + 1}`}
              className="rounded-lg object-cover w-full h-40"
            />
          ))}
        </div>
      )}

      <div className="flex items-center space-x-4 text-gray-600 mb-3">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={isLiked ? handleUnlike : handleLike}
            disabled={isLiking || isUnliking}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <span className="text-sm">{likeCounts}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <span className="text-sm">{commentCount}</span>
        </div>
      </div>

      {/* Hiển thị danh sách comment */}
      {comments.length > 0 && (
        <div className="mb-3">
          {comments.map((comment) => (
            <div key={comment.comment_id} className="flex items-start space-x-2 mb-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment?.user?.avatar_url} alt={comment?.user?.full_name} />
                <AvatarFallback>{comment?.user?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <p className="text-sm font-semibold">{comment.user?.full_name}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteComment(comment.comment_id)}
                disabled={isDeletingComment}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Form thêm comment */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Add a comment..."
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleCreateComment} disabled={isCreatingComment}>
          Post
        </Button>
      </div>
    </div>
  );
}