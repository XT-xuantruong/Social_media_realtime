import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FriendCard } from './FriendCard';
import { FriendRequestCard } from './FriendRequestCard';
import { PaginatedResponse, FriendRequest } from '@/interfaces/friend';
import { UserInfo } from '@/interfaces/user';

interface FriendTabsProps {
  friends: PaginatedResponse<UserInfo> | null;
  friendRequests: PaginatedResponse<FriendRequest<UserInfo>> | null;
  friendStatuses: { [key: string]: 'add' | 'sent' | 'friend' };
  mutualFriendsCount: number;
  userId: string;
  isCurrentUser: boolean;
  onSendFriendRequest: (friendId: string) => void;
  onRemoveFriend: (friendshipId: string) => void;
  onAcceptFriendRequest: (friendshipId: string) => void;
  onRejectFriendRequest: (friendshipId: string) => void;
}

export const FriendTabs = ({
  friends,
  friendRequests,
  friendStatuses,
  mutualFriendsCount,
  userId,
  isCurrentUser,
  onSendFriendRequest,
  onRemoveFriend,
  onAcceptFriendRequest,
  onRejectFriendRequest,
}: FriendTabsProps) => {
  return (
    <Tabs defaultValue="friend" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger
          value="friend"
          className="text-lg font-semibold data-[state=active]:bg-blue-500 data-[state=active]:text-white"
        >
          Friends
        </TabsTrigger>
        <TabsTrigger
          value="friend_request"
          className="text-lg font-semibold data-[state=active]:bg-blue-500 data-[state=active]:text-white"
        >
          Friend Requests
        </TabsTrigger>
      </TabsList>

      <TabsContent value="friend">
        {friends?.items.length === 0 ? (
          <div className="text-center text-gray-500">No friends to display.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {friends?.items
              .filter((friend) => friend.id !== userId)
              .map((friend) => {
                const friendId = friend.friendId;
                const status = friendStatuses[friendId] || 'add';
                return (
                  <FriendCard
                    key={friendId}
                    friend={friend}
                    friendId={friendId}
                    status={status}
                    mutualFriendsCount={mutualFriendsCount}
                    isCurrentUser={isCurrentUser}
                    onSendFriendRequest={onSendFriendRequest}
                    onRemoveFriend={onRemoveFriend}
                  />
                );
              })}
          </div>
        )}
      </TabsContent>

      <TabsContent value="friend_request">
        {friendRequests?.items.length === 0 ? (
          <div className="text-center text-gray-500">No friend requests.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {friendRequests?.items.map((friendRequest) => (
              <FriendRequestCard
                key={friendRequest.user.id}
                friendRequest={friendRequest}
                mutualFriendsCount={mutualFriendsCount}
                onAccept={onAcceptFriendRequest}
                onReject={onRejectFriendRequest}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};