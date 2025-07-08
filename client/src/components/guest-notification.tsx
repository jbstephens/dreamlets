import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Clock, Crown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function GuestNotification() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <Alert className="bg-gradient-to-r from-coral/10 to-sunset/10 border-coral/30 mb-8">
      <Heart className="h-5 w-5 text-coral" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-medium text-navy">
              <Clock className="h-4 w-4 inline mr-1" />
              Guest Mode - Try Before You Buy!
            </p>
            <p className="text-sm text-gray-600">
              You can create one story as a guest. Your kids, characters, and story will be saved temporarily.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="border-coral text-coral hover:bg-coral hover:text-white"
            onClick={() => window.location.href = "/api/login"}
          >
            <Crown className="h-4 w-4 mr-1" />
            Sign Up Free
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}