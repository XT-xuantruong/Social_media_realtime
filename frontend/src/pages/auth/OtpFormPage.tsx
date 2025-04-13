/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { z } from "zod";
import ReusableForm, {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
} from "@/components/ReusableForm";
import { Button } from "@/components/ui/button";
import { useSendOtpMutation, useVerifyOtpMutation } from "@/services/rest_api/AuthServices";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const otpSchema = z.object({
  otp: z.string().length(6, "Mã OTP phải có đúng 6 chữ số").regex(/^[0-9]+$/, "Mã OTP chỉ được chứa số"),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function OtpFormPage() {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpState, setOtpState] = useState(new Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(30);
  const [verifyOtp] = useVerifyOtpMutation();
  const [sendOtp] = useSendOtpMutation();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (
    index: number,
    value: string,
    setFieldValue: (field: "otp", value: string) => void
  ) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otpState];
    newOtp[index] = value;
    setOtpState(newOtp);
    setFieldValue("otp", newOtp.join("")); // Cập nhật giá trị form
    
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpState[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (data: OtpFormData) => {
    try {
      setLoading(true);
      const response = await verifyOtp(data.otp).unwrap();
      if (response.status === 400){
        toast({
          title: "Verify OTP Error",
          variant: "destructive",
          description: response.message,
        });
        return;
      } else if (response.status === 200) {
        toast({
          title: "Verify OTP Success",
          description: response.message,
        });
        // Redirect to the main page or perform any other action
      }
    } catch (error: any) {
      toast({
        title: "Verify Error",
        variant: "destructive",
        description: error?.data?.message || "An error occurred",
      });
      console.error("Lỗi xác thực OTP:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      const response = await sendOtp(null).unwrap();
      if (response.status === 200) {
        toast({
          title: "Gửi lại OTP thành công",
          description: "Mã OTP mới đã được gửi đến email của bạn.",
        });
        setResendTimer(30); // Reset timer sau khi gửi thành công
      } else {
        toast({
          title: "Lỗi gửi lại OTP",
          variant: "destructive",
          description: response.message || "Không thể gửi lại OTP.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi gửi lại OTP",
        variant: "destructive",
        description: error?.data?.message || "Đã xảy ra lỗi khi gửi lại OTP.",
      });
      console.error("Lỗi gửi lại OTP:", error);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Xác thực OTP</h2>
      <p className="text-sm text-gray-600 mb-6 text-center">
        Chúng tôi đã gửi mã đến <strong>email của bạn</strong>
      </p>
      <ReusableForm
        schema={otpSchema}
        onSubmit={handleSubmit}
        defaultValues={{ otp: "" }}
        submitText={loading ? "Đang xác thực..." : "Xác thực OTP"}
        isLoading={loading}
      >
        {({ setValue, formState: { errors } }) => (
          <FormItem>
            <FormLabel>Mã OTP</FormLabel>
            <FormControl>
              <div className="flex gap-2 justify-center">
                {otpState.map((value, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value, setValue)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg border rounded"
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage>{errors.otp?.message}</FormMessage>
          </FormItem>
        )}
      </ReusableForm>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Chưa nhận được mã? {" "}
          <Button
            variant="link"
            className="p-0"
            onClick={handleResendOtp}
            disabled={resendTimer > 0 || resendLoading}
          >
            {resendLoading
              ? "Đang gửi..."
              : resendTimer > 0
              ? `Gửi lại OTP sau ${resendTimer}s`
              : "Gửi lại OTP"}
          </Button>
        </p>
        <Button onClick={() => navigate("/register")} variant="link" className="mt-2">
          Quay lại Đăng ký
        </Button>
      </div>
    </div>
  );
}