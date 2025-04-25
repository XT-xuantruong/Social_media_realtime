/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/index';
import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReusableForm, {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ReusableForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
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
  useGetByIdQuery,
  useUpdateUserMutation,
} from '@/services/rest_api/UserSerivces';
import {
  useGetFriendsQuery,
  useGetFriendRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useUnfriendMutation,
} from '@/services/graphql/friendServicesGQL';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { z } from 'zod';
import {
  Check,
  UserRoundPlus,
  UserRoundX,
  X,
  Users,
  SendHorizontal,
} from 'lucide-react';
import { FriendRequest, PaginatedResponse } from '@/interfaces/friend';
import { UserInfo } from '@/interfaces/user';

type PrivacyType = 'public' | 'private' | 'friends';

const profileFormSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters.' })
    .optional(),
  bio: z
    .string()
    .max(500, { message: 'Bio cannot exceed 500 characters.' })
    .optional(),
  privacy: z.enum(['public', 'private', 'friends'] as const).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const [friendStatuses, setFriendStatuses] = useState<{
    [key: string]: 'add' | 'sent' | 'friend';
  }>({});
  const { toast } = useToast();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [friendStatus, setFriendStatus] = useState<'add' | 'sent' | 'friend'>(
    'add'
  );

  const [friends, setFriend] = useState<PaginatedResponse<UserInfo> | null>(
    null
  );
  const [friendRequests, setFriendRequests] = useState<PaginatedResponse<
    FriendRequest<UserInfo>
  > | null>(null);

  const me = useSelector((state: RootState) => state.auth.user);

  const { data: myFriendsData, refetch: refetchMyFriends } = useGetFriendsQuery(
    { limit: 100, offset: 0, currentUserId: me?.id || '' },
    { skip: !me?.id }
  );

  const friendOfMe = myFriendsData;

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const { data: userByID, isLoading: isFetchingUser } = useGetByIdQuery(
    id as string
  );

  // Lấy danh sách bạn bè của profile đang xem
  const { data: friendsData, refetch: refetchFriends } = useGetFriendsQuery(
    { limit: 10, offset: 0, currentUserId: id || '' },
    { skip: !id || !userByID?.data?.id }
  );

  const { data: friendRequestsData, refetch: refetchFriendRequests } =
    useGetFriendRequestsQuery(
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
      // Nếu API thất bại, hoàn nguyên trạng thái
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

  const handlereject = async (friendId: string) => {
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

  const handleremove = async (friendId: string) => {
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
    friendOfMe?.items.forEach((item) => {
      if (item.id === id || item.friendId === id) {
        if (item.friend_status === 'pending') {
          setFriendStatus('sent');
        }
        if (item.friend_status === 'accepted') {
          setFriendStatus('friend');
        }
      }
    });
  }, [friendOfMe, id]);

  useEffect(() => {
    if (userByID) {
      setAvatarPreview(userByID.data.avatar_url || '');
    }
  }, [userByID]);

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

  const onSubmit = async (formData: ProfileFormValues) => {
    try {
      await updateUser({
        data: {
          full_name: formData.full_name,
          bio: formData.bio,
          privacy: formData.privacy,
        },
        file: avatarFile,
      })
        .unwrap()
        .then(() => {
          toast({
            title: 'Profile updated',
            description: 'Your profile has been updated successfully.',
          });
        });
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'An unknown error occurred';
      toast({
        variant: 'destructive',
        title: 'Update failed!',
        description: errorMessage,
      });
      console.error('Update error:', err);
    }
  };

  if (isFetchingUser || !userByID) {
    return <div>Loading...</div>;
  }

  const defaultValues = {
    full_name: userByID.data.full_name || '',
    bio: userByID.data.bio || '',
    privacy: (userByID.data.privacy as PrivacyType) || 'public',
  };

  return (
    <div className="w-full max-w-xl p-8 bg-white border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Profile
      </h2>

      <div className="flex flex-col items-center space-y-4 mb-6">
        <Avatar
          className="w-24 h-24 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <AvatarImage src={avatarPreview} />
          <AvatarFallback>{userByID.data.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarUpload}
          accept="image/*"
          className="hidden"
        />
        {userByID.data.id === me?.id ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Avatar
            </Button>
          </>
        ) : (
          <>
            {friendStatus === 'friend' ? (
              <Button variant="outline" disabled>
                <Users />
                Friend
              </Button>
            ) : friendStatus === 'sent' ? (
              <Button variant="outline" disabled>
                <SendHorizontal />
                Sent
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  hadlesend(id as string);
                }}
              >
                <UserRoundPlus />
                Add friend
              </Button>
            )}
          </>
        )}
      </div>

      <Tabs defaultValue="profile" className="w-full h-[400px]">
        <TabsList
          className={
            userByID.data.id === me?.id
              ? 'grid w-full grid-cols-3'
              : 'grid w-full grid-cols-2'
          }
        >
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="friend">Friends</TabsTrigger>
          {userByID.data.id === me?.id && (
            <>
              <TabsTrigger value="friend_request">Friend request</TabsTrigger>
            </>
          )}
        </TabsList>
        <TabsContent value="profile">
          <ReusableForm
            schema={profileFormSchema}
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            submitText={
              userByID.data.id === me?.id
                ? isUpdating
                  ? 'Saving changes...'
                  : 'Save Changes'
                : undefined
            }
            isLoading={userByID.data.id === me?.id ? isUpdating : false}
            hideSubmitButton={userByID.data.id !== me?.id}
          >
            {({ control }) => (
              <>
                <FormField
                  control={control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          disabled={isUpdating || userByID.data.id !== me?.id}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself"
                          className="resize-none"
                          rows={4}
                          disabled={isUpdating || userByID.data.id !== me?.id}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {userByID.data.id === me?.id && (
                  <>
                    <FormField
                      control={control}
                      name="privacy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Privacy Setting</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isUpdating}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select privacy level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="friends">
                                Friends Only
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </>
            )}
          </ReusableForm>
        </TabsContent>
        <TabsContent value="friend">
          <Table>
            <TableBody>
              {friends?.items
                .filter((friend) => friend.id !== id)
                .map((friend) => {
                  const friendId = friend.friendId;
                  const status = friendStatuses[friendId] || 'add';
                  return (
                    <TableRow key={friendId}>
                      <Link to={`/profile/${friend.id}`}>
                        <TableCell className="font-medium">
                          <Avatar className="w-20 h-20 rounded-md">
                            <AvatarImage src={friend.avatar_url} />
                            <AvatarFallback>
                              {friend.full_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>{friend.full_name}</TableCell>
                      </Link>
                      <TableCell className="text-right">
                        <div className="space-x-2">
                          {id !== me?.id ? (
                            <>
                              {status === 'friend' ? (
                                <Button variant="outline" disabled>
                                  <Users />
                                  Friend
                                </Button>
                              ) : status === 'sent' ? (
                                <Button variant="outline" disabled>
                                  <SendHorizontal />
                                  Sent
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleSendFriendRequestInList(friendId)
                                  }
                                >
                                  <UserRoundPlus />
                                  Add friend
                                </Button>
                              )}
                            </>
                          ) : (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                  <UserRoundX />
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
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleremove(friend.friendshipId)
                                    }
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
        </TabsContent>
        {id === me?.id && (
          <>
            <TabsContent value="friend_request">
              <Table>
                <TableBody>
                  {friendRequests?.items.map((friendRequest) => (
                    <TableRow key={friendRequest.user.id}>
                      <TableCell className="font-medium">
                        <Avatar className="w-20 h-20 rounded-md">
                          <AvatarImage src={friendRequest.user.avatar_url} />
                          <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>{friendRequest.user.full_name}</TableCell>
                      <TableCell className="text-right">
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              handleAccept(friendRequest.friendshipId)
                            }
                          >
                            <Check />
                            Accept
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline">
                                <X />
                                Reject
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure you want to reject this friend
                                  request?
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
                                    handlereject(friendRequest.friendshipId)
                                  }
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
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
