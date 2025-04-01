import { ReactNode } from "react";
import { useForm, UseFormReturn, FieldValues, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Schema } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ReusableFormProps<T extends FieldValues> {
  schema: Schema<T>;
  onSubmit: (data: T) => void;
  children: (form: UseFormReturn<T>) => ReactNode;
  submitText?: string;
  defaultValues?: DefaultValues<T>;
  isLoading?: boolean;
  hideSubmitButton?: boolean; // Thêm prop để ẩn nút submit
}

export default function ReusableForm<T extends FieldValues>({
  schema,
  onSubmit,
  children,
  submitText = "Submit",
  defaultValues,
  isLoading = false,
  hideSubmitButton = false,
}: ReusableFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {children(form)}
        {!hideSubmitButton && (
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              submitText
            )}
          </Button>
        )}
      </form>
    </Form>
  );
}

export {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
};