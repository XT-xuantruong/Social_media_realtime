/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/index';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TabsContent } from '@/components/ui/tabs';
import { useGetByIdQuery } from '@/services/rest_api/UserSerivces';
import { useGetFriendsQuery, useGetFriendRequestsQuery } from '@/services/graphql/friendServicesGQL';
import { PaginatedResponse } from '@/interfaces/friend';
import { UserInfo } from '@/interfaces/user';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { BioSection } from '@/components/profile/BioSection';
import { PostsSection } from '@/components/profile/PostsSection';
import { FriendsSection } from '@/components/profile/FriendsSection';
import { FriendRequestsSection } from '@/components/profile/FriendRequestsSection';

export default function ProfilePage() {
  const [friendStatuses, setFriendStatuses] = useState<{
    [key: string]: 'add' | 'sent' | 'friend';
  }>({});
  const { id } = useParams();
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [friendStatus, setFriendStatus] = useState<'add' | 'sent' | 'friend'>('add');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [friends, setFriend] = useState<PaginatedResponse<UserInfo> | null>(null);
  const [friendRequests, setFriendRequests] = useState<PaginatedResponse<any> | null>(null);

  const me = useSelector((state: RootState) => state.auth.user);
  const { data: myFriendsData, refetch: refetchMyFriends } = useGetFriendsQuery(
    { limit: 100, offset: 0, currentUserId: me?.id || '' },
    { skip: !me?.id }
  );
  const friendOfMe = myFriendsData;

  const { data: userByID, isLoading: isFetchingUser } = useGetByIdQuery(id as string);
  const { data: friendsData, refetch: refetchFriends } = useGetFriendsQuery(
    { limit: 10, offset: 0, currentUserId: id || '' },
    { skip: !id || !userByID?.data?.id }
  );
  const { data: friendRequestsData, refetch: refetchFriendRequests } = useGetFriendRequestsQuery(
    { limit: 10, offset: 0, currentUserId: id || '' },
    { skip: !id || !me?.id }
  );

  useEffect(() => {
    if (friendOfMe?.items) {
      const initialStatuses: { [key: string]: 'add' | 'sent' | 'friend' } = {};
      friendOfMe.items.forEach((item: any) => {
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
    if (friendRequestsData) {
      setFriendRequests(friendRequestsData);
    }

    if (friendsData && userByID) {
      const filteredFriends = friendsData.items.filter(
        (friend: UserInfo) => friend.friend_status === 'accepted'
      );
      setFriend({ ...friendsData, items: filteredFriends });
    }
  }, [friendsData, friendRequestsData, userByID]);

  if (isFetchingUser || !userByID) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full mx-auto bg-white text-black">
      <ProfileHeader
        userByID={userByID}
        friendOfMe={friendOfMe}
        friendStatus={friendStatus}
        setFriendStatus={setFriendStatus}
        avatarPreview={avatarPreview}
        setAvatarPreview={setAvatarPreview}
        setAvatarFile={setAvatarFile}
        setIsEditModalOpen={setIsEditModalOpen}
        refetchFriends={refetchFriends}
        refetchMyFriends={refetchMyFriends}
      />

      <EditProfileModal
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        userByID={userByID}
        avatarPreview={avatarPreview}
        avatarFile={avatarFile}
      />

      <ProfileTabs userId={id as string}>
        <div className="flex p-4 space-x-4">
          <BioSection bio={userByID?.data?.bio} />

          <div className="w-2/3 space-y-4">
            <TabsContent value="posts">
              <PostsSection userId={id as string} />
            </TabsContent>

            <TabsContent value="friends">
              <FriendsSection
                userId={id as string}
                friends={friends}
                friendStatuses={friendStatuses}
                setFriendStatuses={setFriendStatuses}
                refetchFriends={refetchFriends}
                refetchMyFriends={refetchMyFriends}
              />
            </TabsContent>

            {id === me?.id && (
              <TabsContent value="friend_requests">
                <FriendRequestsSection
                  userId={id as string}
                  friendRequests={friendRequests}
                  refetchFriendRequests={refetchFriendRequests}
                  refetchFriends={refetchFriends}
                  refetchMyFriends={refetchMyFriends}
                />
              </TabsContent>
            )}
          </div>
        </div>
      </ProfileTabs>
    </div>
  );
}