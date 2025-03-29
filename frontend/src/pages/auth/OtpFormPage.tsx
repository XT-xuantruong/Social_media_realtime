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

const otpSchema = z.object({
  otp: z.string().length(6, "Mã OTP phải có đúng 6 chữ số").regex(/^[0-9]+$/, "Mã OTP chỉ được chứa số"),
});

type OtpFormData = z.infer<typeof otpSchema>;

export default function OtpFormPage() {
  const [otpState, setOtpState] = useState(new Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otpState];
    newOtp[index] = value;
    setOtpState(newOtp);
    
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpState[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = () => {
    const otpValue = otpState.join("");
    console.log("OTP submitted:", otpValue);
  };

  return (
    <div className="w-full max-w-md p-8 bg-white border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Verify OTP</h2>
      <p className="text-sm text-gray-600 mb-6 text-center">
        We’ve sent a code to <strong>your email</strong>
      </p>
      <ReusableForm schema={otpSchema} onSubmit={handleSubmit} submitText="Verify">
        {() => (
          <FormItem>
            <FormLabel>OTP Code</FormLabel>
            <FormControl>
              <div className="flex gap-2 justify-center">
                {otpState.map((value, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg border rounded"
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      </ReusableForm>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Didn’t receive the code? {" "}
          <Button
            variant="link"
            className="p-0"
            onClick={() => setResendTimer(30)}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
          </Button>
        </p>
        <Button variant="link" className="mt-2">
          Back to Register
        </Button>
      </div>
    </div>
  );
}