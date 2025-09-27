"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError("Username must be alphanumeric only");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // For demo purposes, we'll always redirect to 2FA
    // In a real app, you would authenticate against your backend
    router.push(
      `/2fa-verify?type=login&username=${encodeURIComponent(username)}`
    );

    setIsSubmitting(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4">
      {/* Background blur effect */}
      <div className="absolute inset-0 gradient-accent-blur opacity-20" />

      <Card className="w-full max-w-md glass-card-enhanced shadow-lg relative card-entrance flex flex-col">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your Zenopay account
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-8 px-8 pb-8">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-sm font-medium text-foreground"
            >
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.replace(/[^a-zA-Z0-9]/g, ""))
              }
              onKeyPress={handleKeyPress}
              placeholder="Enter your username"
              className="focus-glow bg-input border-border text-foreground placeholder:text-muted-foreground h-12 text-base transition-all duration-200 hover:border-accent/50 cursor-text"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your password"
              className="focus-glow bg-input border-border text-foreground placeholder:text-muted-foreground h-12 text-base transition-all duration-200 hover:border-accent/50 cursor-text"
              disabled={isSubmitting}
            />
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  window.open(
                    "https://nguyet-erythemal-sherlyn.ngrok-free.dev/forgot-password",
                    "_blank"
                  );
                }}
                className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer transition-colors duration-200 font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <Button
              onClick={handleLogin}
              disabled={!username.trim() || !password.trim() || isSubmitting}
              className="w-full gradient-linear hover:glow-accent-sm button-press text-white font-semibold h-14 text-lg rounded-xl border-0 shadow-lg cursor-pointer disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? "Signing In..." : "Login"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Secure authentication with 2FA verification
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
