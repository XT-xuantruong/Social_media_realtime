import { useRef, useState } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Define the privacy type
type PrivacyType = 'public' | 'private' | 'friends';

// Zod schema for form validation
const profileFormSchema = z.object({
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }).optional(),
  bio: z.string().max(500, { message: 'Bio cannot exceed 500 characters.' }).optional(),
  privacy: z.enum(['public', 'private', 'friends'] as const).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('https://via.placeholder.com/150'); 
  const [loading] = useState(false); 

  // Mock user data
  const defaultValues = {
    full_name: 'John Doe',
    bio: 'Hello World',
    privacy: 'public' as PrivacyType,
  };

  // Handle avatar upload (chỉ hiển thị preview)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (values: ProfileFormValues) => {
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
    });
    console.log('Form submitted:', values);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Edit Profile</h2>
        <p className="text-muted-foreground">Update your personal information and privacy settings</p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <Avatar
          className="w-24 h-24 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <AvatarImage src={avatarPreview} />
          <AvatarFallback>{defaultValues.full_name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarUpload}
          accept="image/*"
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          Change Avatar
        </Button>
      </div>

      <ReusableForm
        schema={profileFormSchema}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
        submitText={loading ? 'Saving changes...' : 'Save Changes'}
        isLoading={loading}
      >
        {({ control }) => (
          <>
            {/* Full Name */}
            <FormField
              control={control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
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
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Privacy */}
            <FormField
              control={control}
              name="privacy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Privacy Setting</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select privacy level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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
  );
}