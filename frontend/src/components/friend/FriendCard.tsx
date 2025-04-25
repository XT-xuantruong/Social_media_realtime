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
import { Users, UserRoundPlus, UserRoundX, SendHorizontal } from 'lucide-react';
import { UserInfo } from '@/interfaces/user';

interface FriendCardProps {
  friend: UserInfo;
  friendId: string;
  status: 'add' | 'sent' | 'friend';
  mutualFriendsCount: number;
  isCurrentUser: boolean;
  onSendFriendRequest: (friendId: string) => void;
  onRemoveFriend: (friendshipId: string) => void;
}

export const FriendCard = ({
  friend,
  friendId,
  status,
  mutualFriendsCount,
  isCurrentUser,
  onSendFriendRequest,
  onRemoveFriend,
}: FriendCardProps) => {
  return (
    <div className="flex flex-col p-4 bg-gray-100 rounded-lg shadow-md">
      <Link to={`/profile/${friend.id}`} className="flex flex-col items-center">
        <Avatar className="w-24 h-24 rounded-md mb-2">
          <AvatarImage src={friend.avatar_url} />
          <AvatarFallback>{friend.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <h3 className="text-lg font-semibold text-gray-800">{friend.full_name}</h3>
        <p className="text-sm text-gray-500">{mutualFriendsCount} friends</p>
      </Link>
      <div className="flex justify-center space-x-2 mt-4">
        {!isCurrentUser ? (
          <>
            {status === 'friend' ? (
              <Button
                variant="outline"
                className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                disabled
              >
                <Users className="w-4 h-4 mr-2" />
                Friend
              </Button>
            ) : status === 'sent' ? (
              <Button
                variant="outline"
                className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                disabled
              >
                <SendHorizontal className="w-4 h-4 mr-2" />
                Sent
              </Button>
            ) : (
              <Button
                variant="outline"
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => onSendFriendRequest(friendId)}
              >
                <UserRoundPlus className="w-4 h-4 mr-2" />
                Add Friend
              </Button>
            )}
          </>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                <UserRoundX className="w-4 h-4 mr-2" />
                Unfriend
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to remove this friend?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. You and this user will no longer be connected as friends.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onRemoveFriend(friend.friendshipId)}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};