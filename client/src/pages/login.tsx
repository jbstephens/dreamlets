import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { trackEvent } from "@/lib/analytics";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log("Making request to login with data:", data);
      
      const response = await apiRequest("POST", "/api/auth/login", data);
      const result = await response.json();
      
      console.log("Login response:", result);
      return result;
    },
    onSuccess: () => {
      console.log("Login success!");
      
      // Track successful login
      trackEvent('user_login', 'account', 'login_completed');
      
      // Refresh user data and other queries
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kids"] });
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      
      toast({
        title: "Welcome back!",
        description: "You're now logged in.",
      });
      
      // Navigate to create page 
      navigate("/create");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your email and password.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted:", formData);
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    console.log("About to submit login");
    loginMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-lavender-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-coral-600">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">
            Log in to access your saved stories and create new adventures!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="mt-1"
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
                placeholder="Your password"
                className="mt-1"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-coral-500 hover:bg-coral-600 text-white font-semibold py-3 text-base mt-6"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending 
                ? "Logging in..." 
                : "Log In"
              }
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-coral-600 hover:underline font-medium">
              Create one now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}