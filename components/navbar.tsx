"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { Zap, Wallet, LayoutDashboard, LogOut, Loader2 } from "lucide-react";
import Image from "next/image";

interface AssetItem {
  contract_display_name: string;
  logo_url: string;
  balance: string;
  quote_rate: number;
  contract_decimals: number;
  contract_ticker_symbol: string;
  quote: number;
}

interface WalletData {
  address: string;
  chain_name: string;
  items: AssetItem[];
}

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [walletData, setWalletData] = useState<WalletData | null>(null);

  const fetchWalletBalance = async (
    walletAddress: string,
    chainName: string = "eth-sepolia"
  ) => {
    try {
      const response = await fetch(
        `/api/wallet/balance?address=${walletAddress}&chain=${chainName}`
      );
      const result = await response.json();

      if (result.success) {
        return {
          address: walletAddress,
          chain_name: chainName,
          items: result.data.items || [],
        };
      } else {
        console.error("Failed to fetch balance:", result.error);
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      throw error;
    }
  };

  const convertToEth = (balance: string, decimals: number): string => {
    const balanceNum = parseFloat(balance);
    const divisor = Math.pow(10, decimals);
    const ethValue = balanceNum / divisor;
    return ethValue.toFixed(6);
  };

  const formatUSD = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleCreateId = () => {
    window.open("https://nguyet-erythemal-sherlyn.ngrok-free.dev", "_blank");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handlePreviewAssets = async () => {
    setIsLoadingAssets(true);
    try {
      const data = await fetchWalletBalance(
        "0xcA8Fa8f0b631EcdB18Cda619C4Fc9d197c8aFfCa",
        "eth-sepolia"
      );
      setWalletData(data);
      setIsSheetOpen(true);
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setIsLoadingAssets(false);
      setIsDropdownOpen(false);
    }
  };

  const handleDashboard = () => {
    console.log("Navigate to dashboard");
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-radial rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">Zenopay</span>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleLogin}
                  className="border-border hover:bg-secondary/20 hover:text-accent button-press text-foreground h-10 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 hover:scale-[0.98]"
                >
                  Login
                </Button>
                <Button
                  onClick={handleCreateId}
                  className="gradient-linear hover:glow-accent-sm button-press text-white border-0 h-10 px-6 rounded-xl font-semibold cursor-pointer transition-all duration-200 hover:scale-[0.98]"
                >
                  Create ID
                </Button>
              </>
            ) : (
              <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={(open) => {
                  if (!isLoadingAssets) {
                    setIsDropdownOpen(open);
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer hover-scale transition-all duration-200 hover:scale-110">
                    <AvatarFallback className="gradient-radial text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="glass-card border-border w-48"
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      if (isLoadingAssets) {
                        e.preventDefault();
                        return;
                      }
                      handlePreviewAssets();
                    }}
                    disabled={isLoadingAssets}
                    className="cursor-pointer dropdown-item-hover flex items-center gap-2 transition-colors duration-200 hover:bg-accent/10"
                  >
                    {isLoadingAssets ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Wallet className="w-4 h-4" />
                    )}
                    {isLoadingAssets ? "Loading..." : "Preview Assets"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDashboard}
                    className="cursor-pointer dropdown-item-hover flex items-center gap-2 transition-colors duration-200 hover:bg-accent/10"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer dropdown-item-hover flex items-center gap-2 text-destructive transition-colors duration-200 hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle className="text-xl font-bold">Wallet Assets</SheetTitle>
            {walletData && (
              <div className="space-y-2 mt-2">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Address:</span>
                  <div className="font-mono text-xs break-all mt-1">
                    {walletData.address}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Chain:</span>{" "}
                  {walletData.chain_name}
                </div>
              </div>
            )}
          </SheetHeader>

          <div className="mt-6 flex-1 overflow-y-auto">
            <div className="space-y-4 pb-4 px-4">
              {walletData?.items && walletData.items.length > 0 ? (
                walletData.items.map((asset, index) => {
                  const ethBalance = convertToEth(
                    asset.balance,
                    asset.contract_decimals
                  );

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                          {asset.logo_url ? (
                            <Image
                              width={32}
                              height={32}
                              src={asset.logo_url}
                              alt={asset.contract_display_name || "Token Logo"}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {asset.contract_display_name?.charAt(0) || "?"}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {asset.contract_display_name || "Unknown Token"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {ethBalance} {asset.contract_ticker_symbol}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-medium text-sm">
                          {formatUSD(asset.quote)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${asset.quote_rate?.toFixed(2) || "0.00"}/
                          {asset.contract_ticker_symbol}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No assets found</p>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
