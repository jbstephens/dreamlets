import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSuccessfulRegistration?: () => void;
}

export function AuthModal({ 
  isOpen, 
  onClose, 
  title = "Save Your Stories", 
  description = "Create an account to keep your stories safe and create more!", 
  onSuccessfulRegistration 
}: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const authMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      console.log("Making request to:", endpoint, "with data:", data);
      
      const response = await apiRequest("POST", endpoint, data);
      const result = await response.json();
      
      console.log("Auth response:", result);
      return result;
    },
    onSuccess: () => {
      console.log("Auth success!");
      
      // Refresh user data and other queries
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kids"] });
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      
      onClose();
      
      if (!isLogin) {
        // For new registrations, navigate to create page with welcome parameter
        navigate("/create?welcome=true");
        if (onSuccessfulRegistration) {
          onSuccessfulRegistration();
        }
      } else {
        // For login, just show a success toast
        toast({
          title: "Welcome back!",
          description: "You're now logged in.",
        });
      }
    },
    onError: (error: any) => {
      console.error("Auth error:", error);
      toast({
        title: "Authentication failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted:", { isLogin, formData });
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && !formData.firstName) {
      toast({
        title: "Missing information", 
        description: "Please enter your first name.",
        variant: "destructive",
      });
      return;
    }

    console.log("About to submit auth mutation");
    authMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto bg-white rounded-lg shadow-xl">
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-bold text-coral-600">{title}</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              {description}
            </DialogDescription>
          </DialogHeader>

          {/* Toggle buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isLogin 
                  ? 'bg-white text-coral-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isLogin 
                  ? 'bg-white text-coral-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Log In
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Your first name"
                    className="mt-1 w-full"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Your last name"
                    className="mt-1 w-full"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your@email.com"
                className="mt-1 w-full"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Choose a secure password"
                className="mt-1 w-full"
                required
              />
            </div>

            <div className="pt-6">
              <Button 
                type="submit" 
                className="w-full bg-coral-500 hover:bg-coral-600 text-white font-semibold py-3 text-base rounded-lg"
                disabled={authMutation.isPending}
              >
                {authMutation.isPending 
                  ? (isLogin ? "Logging in..." : "Creating account...")
                  : (isLogin ? "Log In" : "Create Account & Save Stories")
                }
              </Button>
            </div>
          </form>

          <div className="text-center text-sm text-gray-500 mt-4">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-coral-600 hover:underline font-medium"
                >
                  Create one now
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-coral-600 hover:underline font-medium"
                >
                  Log in instead
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}