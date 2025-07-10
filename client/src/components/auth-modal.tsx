import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function AuthModal({ isOpen, onClose, title = "Save Your Stories", description = "Create an account to keep your stories safe and create more!" }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const authMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      return await apiRequest(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: isLogin ? "You're now logged in." : "Your stories are now saved safely.",
      });
      
      // Refresh user data and other queries
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kids"] });
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Authentication failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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

    authMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-coral-600">{title}</DialogTitle>
          <DialogDescription className="text-gray-600">
            {description}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={isLogin ? "login" : "register"} onValueChange={(value) => setIsLogin(value === "login")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register">Create Account</TabsTrigger>
            <TabsTrigger value="login">Log In</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <TabsContent value="register" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Your first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Your last name"
                  />
                </div>
              </div>
            </TabsContent>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Choose a secure password"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-coral-500 hover:bg-coral-600"
              disabled={authMutation.isPending}
            >
              {authMutation.isPending 
                ? (isLogin ? "Logging in..." : "Creating account...")
                : (isLogin ? "Log In" : "Create Account & Save Stories")
              }
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-4">
            {isLogin ? (
              <>
                Don't have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-coral-600 hover:underline"
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
                  className="text-coral-600 hover:underline"
                >
                  Log in instead
                </button>
              </>
            )}
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}