/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/index';
import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  useGetFriendsQuery,
  useGetFriendRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useUnfriendMutation,
} from '@/services/graphql/friendServicesGQL';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, UserRoundPlus, UserRoundX, X, Users, SendHorizontal } from 'lucide-react';
import { FriendRequest, PaginatedResponse } from '@/interfaces/friend';
import { UserInfo } from '@/interfaces/user';
import { Link } from 'react-router-dom';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function FriendsPage() {
  const me = useSelector((state: RootState) => state.auth.user);
  const [friendStatuses, setFriendStatuses] = useState<{
    [key: string]: 'add' | 'sent' | 'friend';
  }>({});
  const { toast } = useToast();
  const id = me?.id;
  const [friends, setFriends] = useState<PaginatedResponse<UserInfo> | null>(null);
  const [friendRequests, setFriendRequests] = useState<PaginatedResponse<
    FriendRequest<UserInfo>
  > | null>(null);

  // Get current user's friends
  const {
    data: myFriendsData,
    refetch: refetchMyFriends,
    isLoading: isLoadingMyFriends,
    error: myFriendsError,
  } = useGetFriendsQuery(
    { limit: 100, offset: 0, currentUserId: me?.id || '' },
    { skip: !me?.id }
  );

  const friendOfMe = myFriendsData;

  // Get friends of viewed profile
  const {
    data: friendsData,
    refetch: refetchFriends,
    isLoading: isLoadingFriends,
    error: friendsError,
  } = useGetFriendsQuery(
    { limit: 10, offset: 0, currentUserId: id || '' },
    { skip: !id }
  );

  const {
    data: friendRequestsData,
    refetch: refetchFriendRequests,
    isLoading: isLoadingFriendRequests,
    error: friendRequestsError,
  } = useGetFriendRequestsQuery(
    { limit: 10, offset: 0, currentUserId: id || '' },
    { skip: !id || !me?.id }
  );

  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest] = useRejectFriendRequestMutation();
  const [sendFriendRequest] = useSendFriendRequestMutation();
  const [removeFriend] = useUnfriendMutation();

  useEffect(() => {
    if (friendOfMe?.items) {
      const initialStatuses: { [key: string]: 'add' | 'sent' | 'friend' } = {};
      friendOfMe.items.forEach((item) => {
        const friendId = item.id === id ? item.friendId : item.id;
        if (friendId) {
          if (item.friend_status === 'pending') {
            initialStatuses[friendId] = 'sent';
          } else if (item.friend_status === 'accepted') {
            initialStatuses[friendId] = 'friend';
          } else {
            initialStatuses[friendId] = 'add';
          }
        }
      });
      setFriendStatuses(initialStatuses);
    }
  }, [friendOfMe, id]);

  useEffect(() => {
    // Handle friend requests
    if (friendRequestsData) {
      console.log('Friend Requests Data:', friendRequestsData); // Debugging
      setFriendRequests(friendRequestsData);
    }

    // Handle friends
    if (friendsData) {
      console.log('Friends Data:', friendsData); // Debugging
      const filteredFriends = friendsData.items.filter(
        (friend: UserInfo) => friend.friend_status === 'accepted'
      );
      setFriends({ ...friendsData, items: filteredFriends });
    }
  }, [friendsData, friendRequestsData]);

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
        [friendId]: 'sent',
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
          setFriendRequests(friendRequestsData ?? null);
        });
    } catch (error) {
      setFriendStatuses((prev) => ({
        ...prev,
        [friendId]: 'add',
      }));
      toast({
        variant: 'destructive',
        title: 'Failed to Send Friend Request',
        description: 'An error occurred while sending the friend request.',
      });
      console.error('Error sending friend request:', error);
    }
  };

  const handleAccept = async (friendId: string) => {
    await acceptFriendRequest({
      friendshipId: friendId,
      currentUserId: id as string,
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

  const handleReject = async (friendId: string) => {
    await rejectFriendRequest({
      friendshipId: friendId,
      currentUserId: id as string,
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

  const handleRemove = async (friendId: string) => {
    await removeFriend({
      friendshipId: friendId,
      currentUserId: id as string,
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

  // Handle loading and error states
  if (isLoadingFriends || isLoadingFriendRequests || isLoadingMyFriends) {
    return <div className="text-center">Loading...</div>;
  }

  if (friendsError || friendRequestsError || myFriendsError) {
    return (
      <div className="text-center text-red-500">
        Error loading data. Please try again later.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl p-8 bg-white border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Friends
      </h2>

      <Tabs defaultValue="friend" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="friend">Friends</TabsTrigger>
          <TabsTrigger value="friend_request">Friend Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="friend">
          {friends?.items.length === 0 ? (
            <div className="text-center text-gray-500">No friends to display.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends?.items
                .filter((friend) => friend.id !== id)
                .map((friend) => {
                  const friendId = friend.friendId;
                  const status = friendStatuses[friendId] || 'add';
                  return (
                    <Card key={friendId} className="flex flex-col items-center">
                      <CardHeader>
                        <Link to={`/profile/${friend.id}`}>
                          <Avatar className="w-20 h-20 rounded-md mx-auto">
                            <AvatarImage src={friend.avatar_url} />
                            <AvatarFallback>
                              {friend.full_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <CardTitle className="text-center mt-2">
                          <Link to={`/profile/${friend.id}`}>
                            {friend.full_name}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardFooter className="flex space-x-2">
                        {id !== me?.id ? (
                          <>
                            {status === 'friend' ? (
                              <Button variant="outline" disabled>
                                <Users className="mr-2 h-4 w-4" />
                                Friend
                              </Button>
                            ) : status === 'sent' ? (
                              <Button variant="outline" disabled>
                                <SendHorizontal className="mr-2 h-4 w-4" />
                                Sent
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                onClick={() =>
                                  handleSendFriendRequestInList(friendId)
                                }
                              >
                                <UserRoundPlus className="mr-2 h-4 w-4" />
                                Add friend
                              </Button>
                            )}
                          </>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline">
                                <UserRoundX className="mr-2 h-4 w-4" />
                                Unfriend
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure you want to remove this friend?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. You and this
                                  user will no longer be connected as friends.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleRemove(friend.friendshipId)
                                  }
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
        <TabsContent value="friend_request">
          {friendRequests?.items.length === 0 ? (
            <div className="text-center text-gray-500">No friend requests.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {friendRequests?.items.map((friendRequest) => (
                <Card
                  key={friendRequest.user.id}
                  className="flex flex-col items-center"
                >
                  <CardHeader>
                    <Avatar className="w-20 h-20 rounded-md mx-auto">
                      <AvatarImage src={friendRequest.user.avatar_url} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-center mt-2">
                      {friendRequest.user.full_name}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleAccept(friendRequest.friendshipId)
                      }
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you sure you want to reject this friend request?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The user will
                            not be added to your friend list.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleReject(friendRequest.friendshipId)
                            }
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}