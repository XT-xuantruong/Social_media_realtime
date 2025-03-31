/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "react-redux";
import { RootState } from "@/stores/index";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@/components/ReusableForm";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUserMutation } from "@/services/UserSerivces";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { z } from "zod";

type PrivacyType = "public" | "private" | "friends";

const profileFormSchema = z.object({
  full_name: z.string().min(2, { message: "Full name must be at least 2 characters." }).optional(),
  bio: z.string().max(500, { message: "Bio cannot exceed 500 characters." }).optional(),
  privacy: z.enum(["public", "private", "friends"] as const).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarFile, setAvatarFile] = useState<File | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const navigate = useNavigate();

  const user = useSelector((state: RootState) => state.auth.user);

  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

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
            title: "Profile updated",
            description: "Your profile has been updated successfully.",
          });
        });
    } catch (err: any) {
      const errorMessage = err?.data?.message || "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Update failed!",
        description: errorMessage,
      });
      console.error("Update error:", err);
    }
  };

  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarPreview(user.avatar_url);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div>
          <p>You need to log in to edit your profile.</p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 bg-white border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Edit Profile</h2>

      <div className="flex flex-col items-center space-y-4 mb-6">
        <Avatar className="w-24 h-24 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <AvatarImage src={avatarPreview} />
          <AvatarFallback>{user?.full_name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          Change Avatar
        </Button>
      </div>

      <ReusableForm
        schema={profileFormSchema}
        onSubmit={onSubmit}
        defaultValues={{
          full_name: user?.full_name || "",
          bio: user?.bio || "",
          privacy: (user?.privacy as PrivacyType) || "public",
        }}
        submitText={isUpdating ? "Saving changes..." : "Save Changes"}
        isLoading={isUpdating}
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
                    <Input placeholder="Your full name" disabled={isUpdating} {...field} />
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
                    <Textarea placeholder="Tell us about yourself" className="resize-none" rows={4} disabled={isUpdating} {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isUpdating}>
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
