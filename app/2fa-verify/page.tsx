"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TwoFactorVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const type = searchParams.get("type"); // "login" or "payment"
  const username = searchParams.get("username");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (!type || !username) {
      router.push("/login");
    }
  }, [type, username, router]);

  const validateOtp = (value: string) => {
    return /^\d{6}$/.test(value);
  };

  const handleVerify = async () => {
    if (!validateOtp(otp)) {
      showToast("Please enter a valid 6-digit OTP", "error");
      return;
    }

    setIsSubmitting(true);

    // Simulate OTP verification delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // For demo purposes, we'll accept any 6-digit OTP
    // In a real app, you would verify against your backend
    const isValidOtp = otp === "123456" || otp.length === 6; // Accept 123456 or any 6-digit code for demo

    if (!isValidOtp) {
      showToast("Invalid OTP. Please try again.", "error");
      setIsSubmitting(false);
      setOtp("");
      return;
    }

    if (type === "login") {
      // Complete login process
      login(username!);
      showToast(`Welcome back, ${username}!`, "success");
      router.push("/");
    } else if (type === "payment") {
      // Complete payment process
      console.log("Payment verified and processed:", { username, amount });
      showToast(`Payment of $${amount} to ${username} verified!`, "success");
      router.push("/?payment=success");
    }

    setIsSubmitting(false);
  };

  const getTitle = () => {
    if (type === "login") return "Verify Your Identity";
    if (type === "payment") return "Verify Payment";
    return "Two-Factor Authentication";
  };

  const getDescription = () => {
    if (type === "login") {
      return "Enter the 6-digit code from your authenticator app";
    }
    if (type === "payment") {
      return `Verify payment of $${amount} to ${username}`;
    }
    return "Enter your verification code";
  };

  if (!type || !username) {
    return null;
  }

  return (
    <div className="h-screen flex items-center justify-center p-4">
      {/* Background blur effect */}
      <div className="absolute inset-0 gradient-accent-blur opacity-20" />

      <Card className="w-full max-w-md glass-card-enhanced shadow-lg relative card-entrance flex flex-col">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-foreground">
            {getTitle()}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {getDescription()}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-8 px-8 pb-8">
          <div className="flex flex-col items-center space-y-4">
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
              className="gap-2"
              disabled={isSubmitting}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                  index={0}
                  className="w-12 h-12 text-lg font-semibold border-border focus-glow bg-input text-foreground transition-all duration-200 hover:border-accent/50 cursor-text"
                />
                <InputOTPSlot
                  index={1}
                  className="w-12 h-12 text-lg font-semibold border-border focus-glow bg-input text-foreground transition-all duration-200 hover:border-accent/50 cursor-text"
                />
                <InputOTPSlot
                  index={2}
                  className="w-12 h-12 text-lg font-semibold border-border focus-glow bg-input text-foreground transition-all duration-200 hover:border-accent/50 cursor-text"
                />
                <InputOTPSlot
                  index={3}
                  className="w-12 h-12 text-lg font-semibold border-border focus-glow bg-input text-foreground transition-all duration-200 hover:border-accent/50 cursor-text"
                />
                <InputOTPSlot
                  index={4}
                  className="w-12 h-12 text-lg font-semibold border-border focus-glow bg-input text-foreground transition-all duration-200 hover:border-accent/50 cursor-text"
                />
                <InputOTPSlot
                  index={5}
                  className="w-12 h-12 text-lg font-semibold border-border focus-glow bg-input text-foreground transition-all duration-200 hover:border-accent/50 cursor-text"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="mt-auto">
            <Button
              onClick={handleVerify}
              disabled={!validateOtp(otp) || isSubmitting}
              className="w-full gradient-linear hover:glow-accent-sm button-press text-white font-semibold h-14 text-lg rounded-xl border-0 shadow-lg cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Didn't receive a code? Check your authenticator app
            </p>
            <p className="text-xs text-muted-foreground">
              For demo: use any 6-digit code or "123456"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}