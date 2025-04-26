/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImageIcon, XIcon } from "lucide-react";
import { useCreatePostMutation } from "@/services/rest_api/postServices";
import { useToast } from "@/hooks/use-toast";
import ReusableForm, { FormField, FormItem, FormControl, FormMessage } from "@/components/ReusableForm";
import { useSelector } from "react-redux";
import { RootState } from "@/stores";
import { UserInfo } from "@/interfaces/user";

const createPostSchema = z.object({
  content: z.string().optional(),
  visibility: z.enum(["public","private"]),
  files: z.array(z.instanceof(File)).max(5, "You can only upload a maximum of 5 images").optional(),
}).refine(
  (data) => data.content?.trim() !== "" || (data.files && data.files.length > 0),
  {
    message: "Please enter content or add at least one image.",
    path: ["content"],
  }
);

type CreatePostFormData = z.infer<typeof createPostSchema>;
interface FormCreatePostProps {
  onPostCreated?: () => void;
}
export default function FormCreatePost({ onPostCreated }: FormCreatePostProps) {
  const user = useSelector((state: RootState) => state.auth.user as UserInfo | null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [createPost, { isLoading }] = useCreatePostMutation();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");

  const defaultValues = {
    content: "",
    visibility: "public" as const,
    files: [],
  };

  const handleSubmit = async (data: CreatePostFormData) => {
    const formData = new FormData();
    formData.append("content", data.content || "");
    formData.append("visibility", data.visibility);
    if (data.files) {
      data.files.forEach((file) => formData.append("files", file));
    }

    try {
      const result = await createPost({ data: formData }).unwrap();
      toast({
        title: "Success",
        description: result.message || "Post created successfully!",
      });
      setPreviews([]);
      onPostCreated?.();
    } catch (error: any) {
      setModalTitle("Error");
      setModalDescription(error?.data?.message || "Failed to create post.");
      setIsModalOpen(true);
    }
  };

  const removeImage = (index: number, files: File[], setFieldValue: (field: "files", value: File[]) => void) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFieldValue("files", newFiles);
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border mx-auto">
      <ReusableForm
        schema={createPostSchema}
        onSubmit={handleSubmit}
        defaultValues={defaultValues}
        isLoading={isLoading}
        submitText="Post"
        hideSubmitButton={true}
      >
        {(form) => (
          <>
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.avatar_url} alt="User" />
                <AvatarFallback>{user?.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 flex-1">
                <p className="text-lg font-semibold text-gray-800">{user?.full_name}</p>
                <FormField
                  control={form.control}
                  name="visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-36 h-9 text-sm border-gray-200">
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Only Me</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="What's on your mind?"
                      {...field}
                      className="w-full h-28 resize-none border-none bg-gray-50 rounded-lg p-4"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between mt-4 border-t pt-4">
              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-full">
                        <ImageIcon className="h-6 w-6 text-blue-600" />
                        <span className="text-gray-700 font-medium">Add Photos</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            const selectedFiles = Array.from(e.target.files || []);
                            if (selectedFiles.length > 0) {
                              const totalFiles = [...(field.value || []), ...selectedFiles];
                              if (totalFiles.length > 5) {
                                setModalTitle("Error");
                                setModalDescription("You can only upload a maximum of 5 images.");
                                setIsModalOpen(true);
                                return;
                              }
                              field.onChange(totalFiles);
                              const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file));
                              setPreviews((prev) => [...prev, ...newPreviews]);
                            }
                          }}
                        />
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="bg-black text-white hover:bg-gray-800 px-5 py-2 font-semibold rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Posting..." : "Post"}
              </Button>
            </div>

            {previews.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group w-16 h-16">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="rounded-lg object-cover w-full h-full"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index, form.getValues("files") || [], form.setValue)}
                    >
                      <XIcon className="h-3 w-3 text-white" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </ReusableForm>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>{modalDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}