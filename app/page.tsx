"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { PAYMENT_OFFSET } from "@/lib/constants";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [username, setUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // Check for payment success from URL params
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      showToast("Payment processed successfully!", "success");
      // Clean URL
      router.replace("/");
    }
  }, [searchParams, showToast, router]);

  const validatePaymentForm = () => {
    if (!username.trim()) {
      showToast("Recipient username is required", "error");
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      showToast("Username must be alphanumeric only", "error");
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return false;
    }
    if (parseFloat(amount) > 10000) {
      showToast("Maximum payment amount is $10,000", "error");
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validatePaymentForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const paymentAmount = parseFloat(amount);

    if (paymentAmount >= PAYMENT_OFFSET) {
      // Redirect to 2FA verification for amounts >= offset
      router.push(`/2fa-verify?type=payment&username=${encodeURIComponent(username)}&amount=${amount}`);
    } else {
      // Process payment directly for amounts < offset
      console.log("Payment processed directly:", { username, amount: paymentAmount });
      showToast(`Payment of $${paymentAmount} sent to ${username}`, "success");
      setUsername("");
      setAmount("");
    }

    setIsSubmitting(false);
  };

  const formatAmount = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    return numericValue;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value);
    setAmount(formatted);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex items-center justify-center p-4">
      {/* Background blur effect */}
      <div className="absolute inset-0 gradient-accent-blur opacity-20" />

      <Card className="w-full max-w-md glass-card-enhanced shadow-lg relative card-entrance flex flex-col">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-foreground">
            Send Payment
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter recipient details and amount
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-8 px-8 pb-8">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-foreground">
              Recipient Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              placeholder="Enter username"
              className="focus-glow bg-input border-border text-foreground placeholder:text-muted-foreground h-12 text-base transition-all duration-200 hover:border-accent/50 cursor-text"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-foreground">
              Amount (USD)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="focus-glow bg-input border-border text-foreground placeholder:text-muted-foreground h-12 text-base pl-10 transition-all duration-200 hover:border-accent/50 cursor-text"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="mt-auto">
            <Button
              onClick={handlePayment}
              disabled={!username.trim() || !amount || parseFloat(amount) <= 0 || isSubmitting}
              className="w-full gradient-linear hover:glow-accent-sm button-press text-white font-semibold h-14 text-lg rounded-xl border-0 shadow-lg cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? "Processing..." : "Pay Now"}
            </Button>
          </div>

          {amount && parseFloat(amount) >= PAYMENT_OFFSET && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Amounts ${PAYMENT_OFFSET}+ require 2FA verification
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
