import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Star, Zap } from "lucide-react";
import { Link } from "wouter";

interface SubscriptionStatusProps {
  storiesUsed?: number;
  limit?: number;
}

export function SubscriptionStatus({ storiesUsed = 0, limit = 3 }: SubscriptionStatusProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Card className="bg-gradient-to-r from-coral to-sunset text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Guest Mode</h3>
              <p className="text-white/90 text-sm">Create an account to save your stories</p>
            </div>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => window.location.href = "/api/login"}
            >
              Sign Up Free
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isUnlimited = user.subscriptionTier === "premium_unlimited";
  const isPremium = user.subscriptionTier?.startsWith("premium");
  const percentage = isUnlimited ? 100 : Math.min((storiesUsed / limit) * 100, 100);

  return (
    <Card className={`border-2 ${isPremium ? 'border-golden bg-gradient-to-r from-golden/10 to-sunset/10' : 'border-coral'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPremium && <Crown className="h-5 w-5 text-golden" />}
            <CardTitle className="text-lg">
              {isUnlimited ? "Unlimited" : isPremium ? "Premium" : "Free"} Plan
            </CardTitle>
            {isPremium && (
              <Badge variant="secondary" className="bg-golden/20 text-golden border-golden/30">
                {isUnlimited ? "Unlimited" : "Premium"}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Stories this month</span>
              <span className="font-medium">
                {storiesUsed} {isUnlimited ? "" : `/ ${limit}`}
              </span>
            </div>
            {!isUnlimited && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    percentage >= 80 ? 'bg-red-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            )}
          </div>

          {/* Get More Stories Button for non-premium users */}
          {!isPremium && (
            <div className="flex justify-center">
              <Link href="/pricing">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-coral text-coral hover:bg-coral hover:text-white"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Get More Stories
                </Button>
              </Link>
            </div>
          )}

          {!isPremium && storiesUsed >= limit * 0.8 && (
            <div className="p-3 bg-sunset/10 rounded-lg border border-sunset/20">
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-sunset mt-0.5" />
                <div>
                  <p className="font-medium text-sunset">Almost at your limit!</p>
                  <p className="text-sm text-gray-600 mb-3">
                    Upgrade to keep creating magical stories for your children.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-sunset hover:bg-sunset/90">
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!isPremium && storiesUsed >= limit && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">Story limit reached</p>
                  <p className="text-sm text-red-600 mb-3">
                    You've used all {limit} stories for this month. Upgrade to continue creating!
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-sunset hover:bg-sunset/90">
                      <Crown className="h-4 w-4 mr-1" />
                      Upgrade to Premium
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}