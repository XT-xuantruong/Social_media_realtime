/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/index';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, UserRoundPlus, SendHorizontal, UserRoundX } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import {
  useSendFriendRequestMutation,
  useUnfriendMutation,
} from '@/services/graphql/friendServicesGQL';
import { PaginatedResponse } from '@/interfaces/friend';
import { Dispatch, SetStateAction } from 'react'; // Import SetStateAction

// Define the FriendStatus type for clarity
type FriendStatus = 'add' | 'sent' | 'friend';

interface FriendsSectionProps {
  userId: string;
  friends: PaginatedResponse<any> | null;
  friendStatuses: { [key: string]: FriendStatus };
  setFriendStatuses: Dispatch<SetStateAction<{ [key: string]: FriendStatus }>>; // Use SetStateAction
  refetchFriends: () => void;
  refetchMyFriends: () => void;
}

export const FriendsSection = ({
  userId,
  friends,
  friendStatuses,
  setFriendStatuses,
  refetchFriends,
  refetchMyFriends,
}: FriendsSectionProps) => {
  const { toast } = useToast();
  const me = useSelector((state: RootState) => state.auth.user);
  const [sendFriendRequest] = useSendFriendRequestMutation();
  const [removeFriend] = useUnfriendMutation();

  const filteredFriends =
    friends?.items?.filter((friend: any) => friend.id !== me?.id) || [];

  const handleSendFriendRequestInList = async (friendId: string) => {
    if (!friendId || !me?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User information is missing. Please try again later.',
      });
      return;
    }

    try {
      setFriendStatuses((prev) => ({
        ...prev,
        [friendId]: 'sent' as FriendStatus, // Explicitly type the value
      }));

      await sendFriendRequest({
        friendId: friendId,
        currentUserId: me.id,
      })
        .unwrap()
        .then(async () => {
          toast({
            title: 'Friend Request Sent',
            description: 'Your friend request has been successfully sent.',
          });
          await refetchFriends();
          await refetchMyFriends();
        });
    } catch (error) {
      setFriendStatuses((prev) => ({
        ...prev,
        [friendId]: 'add' as FriendStatus, // Explicitly type the value
      }));
      toast({
        variant: 'destructive',
        title: 'Failed to Send Friend Request',
        description: 'An error occurred while sending the friend request.',
      });
      console.error('Error sending friend request:', error);
    }
  };

  const handleremove = async (friendId: string) => {
    await removeFriend({
      friendshipId: friendId,
      currentUserId: userId as string,
    })
      .unwrap()
      .then(async () => {
        toast({
          title: 'Unfriended Successfully',
          description: 'This user has been removed from your friends list.',
        });
        await refetchFriends();
        await refetchMyFriends();
      });
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow">
      <h2 className="text-lg font-semibold mb-4">Friends</h2>
      <Table>
        <TableBody>
          {filteredFriends.map((friend: any) => {
            const friendId = friend.friendId;
            const status = friendStatuses[friendId] || 'add';
            return (
              <TableRow key={friendId} className="border-gray-200">
                <Link to={`/profile/${friend.id}`}>
                  <TableCell className="font-medium">
                    <Avatar className="w-10 h-10 rounded-full">
                      <AvatarImage src={friend.avatar_url} />
                      <AvatarFallback>
                        {friend.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="text-black">
                    {friend.full_name}
                  </TableCell>
                </Link>
                <TableCell className="text-right">
                  <div className="space-x-2">
                    {userId !== me?.id ? (
                      <>
                        {status === 'friend' ? (
                          <Button className="bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded">
                            <Users className="w-4 h-4 mr-2" />
                            Friends
                          </Button>
                        ) : status === 'sent' ? (
                          <Button className="bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded">
                            <SendHorizontal className="w-4 h-4 mr-2" />
                            Sent
                          </Button>
                        ) : (
                          <Button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded"
                            onClick={() =>
                              handleSendFriendRequestInList(friendId)
                            }
                          >
                            <UserRoundPlus className="w-4 h-4 mr-2" />
                            Add Friend
                          </Button>
                        )}
                      </>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded">
                            <UserRoundX className="w-4 h-4 mr-2" />
                            Unfriend
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white text-black border-gray-300">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure you want to remove this friend?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-600">
                              This action cannot be undone. You and this user
                              will no longer be connected as friends.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-200 text-black hover:bg-gray-300">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              onClick={() => handleremove(friend.friendshipId)}
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
