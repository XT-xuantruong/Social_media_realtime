/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useUpdateUserMutation } from '@/services/rest_api/UserSerivces';
import { useRef } from 'react';

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

interface EditProfileModalProps {
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  userByID: any;
  avatarPreview: string;
  avatarFile: File | undefined;
  setAvatarFile: (file: File | undefined) => void;
  setAvatarPreview: (preview: string) => void;
}

export const EditProfileModal = ({
  isEditModalOpen,
  setIsEditModalOpen,
  userByID,
  avatarPreview,
  avatarFile,
  setAvatarFile,
  setAvatarPreview,
}: EditProfileModalProps) => {
  const { toast } = useToast();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultValues = {
    full_name: userByID?.data?.full_name || '',
    bio: userByID?.data?.bio || '',
    privacy: (userByID?.data?.privacy as PrivacyType) || 'public',
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
          setIsEditModalOpen(false);
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

  return (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="sm:max-w-[425px] bg-white text-black border-gray-300">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ReusableForm
            schema={profileFormSchema}
            onSubmit={onSubmit}
            defaultValues={defaultValues}
            submitText={isUpdating ? 'Saving...' : 'Save Changes'}
            isLoading={isUpdating}
          >
            {({ control }) => (
              <>
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar
                    className="w-16 h-16 rounded-full cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback>{userByID?.data?.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Avatar
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <FormField
                  control={control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          disabled={isUpdating}
                          className="bg-white text-black border-gray-300"
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
                          className="resize-none bg-white text-black border-gray-300"
                          rows={4}
                          disabled={isUpdating}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectTrigger className="bg-white text-black border-gray-300">
                            <SelectValue placeholder="Select privacy level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white text-black border-gray-300">
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="friends">Friends Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </ReusableForm>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded"
            onClick={() => setIsEditModalOpen(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};