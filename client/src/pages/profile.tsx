import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Crown, CreditCard, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Footer } from "@/components/footer";

export default function Profile() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isCreatingPortal, setIsCreatingPortal] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Get subscription status
  const { data: subscriptionData, isLoading: subLoading } = useQuery({
    queryKey: ["/api/subscription-status"],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleUpgrade = async () => {
    try {
      setIsCreatingPortal(true);
      const response = await apiRequest("POST", "/api/create-checkout-session");
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPortal(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setIsCreatingPortal(true);
      const response = await apiRequest("POST", "/api/create-customer-portal");
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL received");
      }
    } catch (error: any) {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      console.error("Portal error:", error);
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPortal(false);
    }
  };

  if (authLoading || subLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 to-lavender-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-coral-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isPremium = user.subscriptionTier === 'premium_unlimited';
  const hasActiveSubscription = subscriptionData?.hasActiveSubscription || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-lavender-50">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-navy-900">Profile</h1>
            <p className="text-navy-600">Manage your account and subscription</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* User Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-navy-600">Name</label>
                  <p className="text-navy-900 font-medium">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || user.lastName || 'Not provided'
                    }
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-navy-600">Email</label>
                  <p className="text-navy-900 font-medium">{user.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-navy-600">Member Since</label>
                <p className="text-navy-900 font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Subscription Status
              </CardTitle>
              <CardDescription>
                Manage your Dreamlets subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-navy-600">Current Plan:</span>
                    <Badge variant={isPremium ? "default" : "secondary"} className={isPremium ? "bg-coral-500" : ""}>
                      {isPremium ? "Premium Unlimited" : "Free Plan"}
                    </Badge>
                  </div>
                  <p className="text-sm text-navy-600">
                    {isPremium 
                      ? "Unlimited stories every month" 
                      : `${user.storiesThisMonth || 0}/5 stories used this month`
                    }
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3">
                {isPremium || hasActiveSubscription ? (
                  <Button 
                    onClick={handleManageSubscription}
                    disabled={isCreatingPortal}
                    className="bg-navy-600 hover:bg-navy-700 text-white"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {isCreatingPortal ? "Opening..." : "Manage Subscription"}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleUpgrade}
                    disabled={isCreatingPortal}
                    className="bg-coral-500 hover:bg-coral-600 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {isCreatingPortal ? "Creating..." : "Upgrade to Premium"}
                  </Button>
                )}
              </div>

              {!isPremium && !hasActiveSubscription && (
                <div className="bg-mint-50 border border-mint-200 rounded-lg p-4">
                  <h4 className="font-medium text-mint-800 mb-2">Why upgrade to Premium?</h4>
                  <ul className="text-sm text-mint-700 space-y-1">
                    <li>• Unlimited story creation</li>
                    <li>• No monthly limits</li>
                    <li>• Priority story generation</li>
                    <li>• Advanced customization options</li>
                  </ul>
                  <p className="text-sm font-medium text-mint-800 mt-3">
                    Just $19.99/month
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}