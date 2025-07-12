import { History, User, LogOut, Moon, Stars, ChevronDown, CreditCard, LogIn } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      
      // Clear all user data from cache
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kids"] });
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
    },
    onError: () => {
      toast({
        title: "Logout failed", 
        description: "There was an error logging out.",
        variant: "destructive",
      });
    },
  });
  return (
    <nav className="bg-gradient-to-r from-lavender via-coral to-mint shadow-lg sticky top-0 z-50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/create">
            <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="relative">
                <Moon className="h-8 w-8 text-cream animate-pulse" />
                <Stars className="h-4 w-4 text-golden absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-cream tracking-wide">Dreamlets</h1>
                <p className="text-xs text-cream/80 font-medium">✨ Magical Bedtime Stories ✨</p>
              </div>
            </div>
          </Link>
          
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-cream hover:text-golden transition-colors flex items-center bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg">
                      <User className="h-5 w-5 mr-2" />
                      <span className="hidden sm:inline">{user?.firstName || "Menu"}</span>
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm border-white/20">
                    <Link href="/profile">
                      <DropdownMenuItem className="flex items-center cursor-pointer w-full">
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/pricing">
                      <DropdownMenuItem className="flex items-center cursor-pointer">
                        <CreditCard className="h-4 w-4 mr-3" />
                        Pricing
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem 
                      className="flex items-center cursor-pointer text-red-600 hover:text-red-700"
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Link href="/login">
                    <Button
                      className="bg-white/20 text-cream hover:bg-white/30 backdrop-blur-sm shadow-lg border-white/20 text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                      variant="outline"
                      size="sm"
                    >
                      <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Sign In</span>
                      <span className="sm:hidden">In</span>
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      className="bg-cream text-coral hover:bg-cream/90 shadow-lg font-semibold text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                      size="sm"
                    >
                      <span className="hidden sm:inline">Create Account</span>
                      <span className="sm:hidden">Sign Up</span>
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
