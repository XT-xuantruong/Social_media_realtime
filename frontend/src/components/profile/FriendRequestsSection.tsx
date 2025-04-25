/* eslint-disable @typescript-eslint/no-explicit-any */
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
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
import { useAcceptFriendRequestMutation, useRejectFriendRequestMutation } from '@/services/graphql/friendServicesGQL';
import { PaginatedResponse } from '@/interfaces/friend';

interface FriendRequestsSectionProps {
  userId: string;
  friendRequests: PaginatedResponse<any> | null;
  refetchFriendRequests: () => void;
  refetchFriends: () => void;
  refetchMyFriends: () => void;
}

export const FriendRequestsSection = ({
  userId,
  friendRequests,
  refetchFriendRequests,
  refetchFriends,
  refetchMyFriends,
}: FriendRequestsSectionProps) => {
  const { toast } = useToast();
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest] = useRejectFriendRequestMutation();

  const handleAccept = async (friendId: string) => {
    await acceptFriendRequest({
      friendshipId: friendId,
      currentUserId: userId as string,
    })
      .unwrap()
      .then(async () => {
        toast({
          title: 'Friend Request Accepted',
          description: `You have accepted the friend request`,
        });
        await refetchFriendRequests();
        await refetchFriends();
        await refetchMyFriends();
      });
  };

  const handlereject = async (friendId: string) => {
    await rejectFriendRequest({
      friendshipId: friendId,
      currentUserId: userId as string,
    })
      .unwrap()
      .then(async () => {
        toast({
          title: 'Friend Request Rejected',
          description: `You have rejected the friend request`,
        });
        await refetchFriendRequests();
        await refetchMyFriends();
      });
  };

  return (
    <div className="bg-white p-4 rounded-lg border shadow">
      <h2 className="text-lg font-semibold mb-4">Friend Requests</h2>
      <Table>
        <TableBody>
          {friendRequests?.items.map((friendRequest: any) => (
            <TableRow key={friendRequest.user.id} className="border-gray-200">
              <TableCell className="font-medium">
                <Avatar className="w-10 h-10 rounded-full">
                  <AvatarImage src={friendRequest.user.avatar_url} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="text-black">{friendRequest.user.full_name}</TableCell>
              <TableCell className="text-right">
                <div className="space-x-2">
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded"
                    onClick={() => handleAccept(friendRequest.friendshipId)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded">
                        <X className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white text-black border-gray-300">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to reject this friend request?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600">
                          This action cannot be undone. The user will not be added to your friend list.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-200 text-black hover:bg-gray-300">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => handlereject(friendRequest.friendshipId)}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};