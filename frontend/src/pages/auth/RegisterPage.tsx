/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { useState } from "react";
import ReusableForm, {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Checkbox,
} from "@/components/ReusableForm";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { useRegisterMutation } from "@/services/AuthServices";



import { useNavigate } from "react-router-dom";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [register] = useRegisterMutation();
  const { toast } = useToast();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const onSubmit = async (formData: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      const response = await register({
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
      }).unwrap();
      toast({
        title: "Registration successful.",
        description: response.message,
      })
      navigate("/otp");
    } catch (err : any) {
      const errorMessage = err?.data?.message || "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Registration failed, please try again!",
        description: errorMessage,
      });
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white border rounded-lg shadow-lg flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign Up</h2>
      <ReusableForm
        schema={registerSchema}
        onSubmit={onSubmit}
        submitText={loading ? "Registering..." : "Register"}
        defaultValues={{
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          agreeTerms: false,
        }}
        isLoading={loading}
      >
        {({ control }) => (
          <>
            {/* Name Field */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Enter your full name" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        disabled={loading}
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        disabled={loading}
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Agree to Terms */}
            <FormField
              control={control}
              name="agreeTerms"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={loading} />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">
                    I agree to the{" "}
                    <a href="/terms" className="text-blue-600 hover:underline hover:text-blue-500 transition duration-200">
                      Terms & Conditions
                    </a>
                  </FormLabel>
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