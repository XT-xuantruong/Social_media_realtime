import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Check, X } from 'lucide-react';
import { FriendRequest } from '@/interfaces/friend';
import { UserInfo } from '@/interfaces/user';

interface FriendRequestCardProps {
  friendRequest: FriendRequest<UserInfo>;
  mutualFriendsCount: number;
  onAccept: (friendshipId: string) => void;
  onReject: (friendshipId: string) => void;
}

export const FriendRequestCard = ({
  friendRequest,
  mutualFriendsCount,
  onAccept,
  onReject,
}: FriendRequestCardProps) => {
  return (
    <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md">
      <Link to={`/profile/${friendRequest.user.id}`} className="flex flex-col items-center">
        <Avatar className="w-24 h-24 rounded-md mb-2">
          <AvatarImage src={friendRequest.user.avatar_url} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <h3 className="text-lg font-semibold text-gray-800">{friendRequest.user.full_name}</h3>
        <p className="text-sm text-gray-500">{mutualFriendsCount} bạn chung</p>
      </Link>
      <div className="flex justify-center space-x-2 mt-4">
        <Button
          variant="outline"
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => onAccept(friendRequest.friendshipId)}
        >
          <Check className="w-4 h-4 mr-2" />
          Xác nhận
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              <X className="w-4 h-4 mr-2" />
              Xóa
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to reject this friend request?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The user will not be added to your friend list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onReject(friendRequest.friendshipId)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};