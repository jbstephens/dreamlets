import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      console.log("Making request to register with data:", data);
      
      const response = await apiRequest("POST", "/api/auth/register", data);
      const result = await response.json();
      
      console.log("Register response:", result);
      return result;
    },
    onSuccess: () => {
      console.log("Registration success!");
      
      // Refresh user data and other queries
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kids"] });
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      
      toast({
        title: "Account created!",
        description: "Welcome to Dreamlets! Your stories are now saved permanently.",
      });
      
      // Navigate to create page with welcome parameter
      navigate("/create?welcome=true");
    },
    onError: (error: any) => {
      console.error("Register error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted:", formData);
    
    if (!formData.email || !formData.password || !formData.firstName) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    console.log("About to submit registration");
    registerMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-lavender-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-coral-600">Create Account</CardTitle>
          <CardDescription className="text-gray-600">
            Join Dreamlets to save your stories and create unlimited adventures!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Your first name"
                  className="mt-1"
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
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email *
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
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Choose a secure password"
                className="mt-1"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-coral-500 hover:bg-coral-600 text-white font-semibold py-3 text-base mt-6"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending 
                ? "Creating account..." 
                : "Create Account & Save Stories"
              }
            </Button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-coral-600 hover:underline font-medium">
              Log in instead
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}