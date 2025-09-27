"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { userLogin } from "@/utils/loginHelper";

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

  const handleVerify = async () => {
    setIsSubmitting(true);

    if (type === "login") {
      // Complete login process
      if (username) {
        try {
          const response = await userLogin({
            rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
            id: username,
            proof: otp,
          });

          // Check if response has error
          if (response.error) {
            showToast(response.error, "error");
            router.push("/login");
            return;
          }

          // Check if response has result and correct status
          if (response.result && response.result.status === "login_success") {
            // Store dkg_eoa in localStorage
            localStorage.setItem("zenopay-dkg-eoa", response.result.dkg_eoa);

            login(username!);
            showToast(`Welcome back, ${username}!`, "success");
            router.push("/");
          } else {
            showToast("Login verification failed", "error");
            router.push("/login");
          }
        } catch {
          showToast("An error occurred during verification", "error");
          router.push("/login");
        }
      }
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
          <div className="space-y-2">
            <Label
              htmlFor="otp"
              className="text-sm font-medium text-foreground"
            >
              Verify Code
            </Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Verify Code"
              className="focus-glow bg-input border-border text-foreground placeholder:text-muted-foreground h-12 text-base transition-all duration-200 hover:border-accent/50 cursor-text"
              disabled={isSubmitting}
            />
          </div>

          <div className="mt-auto">
            <Button
              onClick={handleVerify}
              disabled={!otp.trim() || isSubmitting}
              className="w-full gradient-linear hover:glow-accent-sm button-press text-white font-semibold h-14 text-lg rounded-xl border-0 shadow-lg cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
