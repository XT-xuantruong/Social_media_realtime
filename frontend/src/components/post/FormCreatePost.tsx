import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageIcon, XIcon } from "lucide-react";

export default function FormCreatePost() {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const totalFiles = [...files, ...selectedFiles];
      if (totalFiles.length > 5) {
        alert("Bạn chỉ có thể tải lên tối đa 5 ảnh");
        return;
      }
      setFiles(totalFiles);
      selectedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() === "" && files.length === 0) {
      alert("Vui lòng nhập nội dung hoặc thêm ít nhất một ảnh");
      return;
    }
    console.log({ content, visibility, files });
    setContent("");
    setVisibility("public");
    setFiles([]);
    setPreviews([]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border mx-auto">
      <div className="flex items-center space-x-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
          <p className="text-lg font-semibold text-gray-800">John Doe</p>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger className="w-36 h-9 text-sm border-gray-200">
              <SelectValue placeholder="Chọn quyền hiển thị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Công khai</SelectItem>
              <SelectItem value="friends">Bạn bè</SelectItem>
              <SelectItem value="private">Chỉ mình tôi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="Bạn đang nghĩ gì?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-28 resize-none border-none bg-gray-50 rounded-lg p-4"
        />

        {previews.length > 0 && (
          <div className="mt-4 flex space-x-2">
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
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => removeImage(index)}
                >
                  <XIcon className="h-3 w-3 text-white" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 border-t pt-4">
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-full">
            <ImageIcon className="h-6 w-6 text-blue-600" />
            <span className="text-gray-700 font-medium">Thêm ảnh</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </label>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2 text-white font-semibold rounded-lg"
            disabled={content.trim() === "" && files.length === 0}
          >
            Đăng bài
          </Button>
        </div>
      </form>
    </div>
  );
}