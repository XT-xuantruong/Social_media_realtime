import { useSelector } from 'react-redux';
import { RootState } from '@/stores/index';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  useGetFriendsQuery,
  useGetFriendRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useUnfriendMutation,
} from '@/services/graphql/friendServicesGQL';
import { PaginatedResponse, FriendRequest } from '@/interfaces/friend';
import { UserInfo } from '@/interfaces/user';
import { FriendTabs } from '@/components/friend/FriendTabs';

export default function FriendsPage() {
  const me = useSelector((state: RootState) => state.auth.user);
  const [friendStatuses, setFriendStatuses] = useState<{
    [key: string]: 'add' | 'sent' | 'friend';
  }>({});
  const { toast } = useToast();
  const id = me?.id;
  const [friends, setFriends] = useState<PaginatedResponse<UserInfo> | null>(null);
  const [friendRequests, setFriendRequests] = useState<PaginatedResponse<FriendRequest<UserInfo>> | null>(null);

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
      console.log("Friend Requests Data:", friendRequestsData); // Debugging
      setFriendRequests(friendRequestsData);
    }

    // Handle friends
    if (friendsData) {
      console.log("Friends Data:", friendsData); // Debugging
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
    <div className="w-full p-8 bg-white border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Friends List</h2>

      <FriendTabs
        friends={friends}
        friendRequests={friendRequests}
        friendStatuses={friendStatuses}
        mutualFriendsCount={friendOfMe?.items?.length || 0}
        userId={id as string}
        isCurrentUser={id === me?.id}
        onSendFriendRequest={handleSendFriendRequestInList}
        onRemoveFriend={handleRemove}
        onAcceptFriendRequest={handleAccept}
        onRejectFriendRequest={handleReject}
      />
    </div>
  );
}