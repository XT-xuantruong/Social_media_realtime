/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/index';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, UserRoundPlus, SendHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSendFriendRequestMutation } from '@/services/graphql/friendServicesGQL';

interface ProfileHeaderProps {
  userByID: any;
  friendOfMe: any;
  friendStatus: 'add' | 'sent' | 'friend';
  setFriendStatus: (status: 'add' | 'sent' | 'friend') => void;
  avatarPreview: string;
  setAvatarPreview: (preview: string) => void;
  setAvatarFile: (file: File | undefined) => void;
  setIsEditModalOpen: (open: boolean) => void;
  refetchFriends: () => void;
  refetchMyFriends: () => void;
}

export const ProfileHeader = ({
  userByID,
  friendOfMe,
  friendStatus,
  setFriendStatus,
  avatarPreview,
  setAvatarPreview,
  setAvatarFile,
  setIsEditModalOpen,
  refetchFriends,
  refetchMyFriends,
}: ProfileHeaderProps) => {
  const { toast } = useToast();
  const me = useSelector((state: RootState) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sendFriendRequest] = useSendFriendRequestMutation();

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const hadlesend = async (id: string) => {
    await sendFriendRequest({
      friendId: id,
      currentUserId: me?.id as string,
    })
      .unwrap()
      .then(async () => {
        toast({
          title: 'Friend Request Sent',
          description: 'Your friend request has been successfully sent.',
        });
        setFriendStatus('sent');
        await refetchFriends();
        await refetchMyFriends();
      });
  };

  useEffect(() => {
    friendOfMe?.items.forEach((item: any) => {
      if (
        item.id === userByID?.data?.id ||
        item.friendId === userByID?.data?.id
      ) {
        if (item.friend_status === 'pending') {
          setFriendStatus('sent');
        }
        if (item.friend_status === 'accepted') {
          setFriendStatus('friend');
        }
      }
    });
  }, [friendOfMe, userByID, setFriendStatus]);

  useEffect(() => {
    if (userByID) {
      setAvatarPreview(userByID.data.avatar_url || '');
    }
  }, [userByID, setAvatarPreview]);

  return (
    <div className="flex items-center p-4 border-b border-gray-200 bg-gray-100">
      <Avatar
        className="w-32 h-32 rounded-full border-4 border-white cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <AvatarImage src={avatarPreview} />
        <AvatarFallback>{userByID?.data?.full_name?.[0] || 'U'}</AvatarFallback>
      </Avatar>
      <div className="ml-4 flex-1">
        <h1 className="text-3xl font-bold">{userByID?.data?.full_name}</h1>
        {/* <p className="text-gray-600">{friendOfMe?.items?.length || 0} friends</p> */}
      </div>
      <div className="flex space-x-2">
        {userByID?.data?.id === me?.id ? (
          <Button
            className="bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <>
            {friendStatus === 'friend' ? (
              <Button className="bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded">
                <Users className="w-4 h-4 mr-2" />
                Friends
              </Button>
            ) : friendStatus === 'sent' ? (
              <Button className="bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded">
                <SendHorizontal className="w-4 h-4 mr-2" />
                Request Sent
              </Button>
            ) : (
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded"
                onClick={() => hadlesend(userByID?.data?.id as string)}
              >
                <UserRoundPlus className="w-4 h-4 mr-2" />
                Add Friend
              </Button>
            )}
          </>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
