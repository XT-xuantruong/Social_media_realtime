import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  images: File[];
  onRemove: (index: number) => void;
}

export default function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  if (!images.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {images.map((file, index) => (
        <div key={index} className="relative group w-16 h-16">
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${index + 1}`}
            className="rounded-lg object-cover w-full h-full"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(index)}
          >
            <X className="h-3 w-3 text-white" />
          </Button>
        </div>
      ))}
    </div>
  );
}