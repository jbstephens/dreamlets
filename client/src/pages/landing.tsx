import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Stars, Sparkles, Heart, BookOpen, Palette, Crown, Check } from "lucide-react";
import { useLocation } from "wouter";
import { AuthModal } from "@/components/auth-modal";
import { useState } from "react";

export default function Landing() {
  const [location, navigate] = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender via-coral to-mint">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <div className="relative">
              <Moon className="h-16 w-16 text-cream animate-pulse" />
              <Stars className="h-8 w-8 text-golden absolute -top-2 -right-2 animate-bounce" />
              <Sparkles className="h-6 w-6 text-cream absolute -bottom-1 -left-1 animate-pulse" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-cream mb-4 tracking-wide">
            Dreamlets
          </h1>
          <p className="text-xl text-cream/90 mb-8 max-w-2xl mx-auto">
            Create magical, personalized bedtime stories for your children with custom illustrations and storytelling
          </p>
          
          <div className="flex flex-col gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-sunset text-white hover:bg-sunset/90 px-8 py-4 text-lg shadow-xl"
              onClick={() => navigate("/create")}
            >
              <Heart className="mr-2 h-5 w-5" />
              Create Your Story
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/20 backdrop-blur-sm border-white/30 text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-sunset mx-auto mb-4" />
              <CardTitle className="text-cream">Personalized Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-cream/80">
                Add your children and favorite characters to create unique stories just for them
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-sm border-white/30 text-center">
            <CardHeader>
              <Palette className="h-12 w-12 text-sunset mx-auto mb-4" />
              <CardTitle className="text-cream">Custom Illustrations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-cream/80">
                Beautiful, personalized images bring every story to life with stunning visuals
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-sm border-white/30 text-center">
            <CardHeader>
              <Stars className="h-12 w-12 text-sunset mx-auto mb-4" />
              <CardTitle className="text-cream">Magical Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-cream/80">
                Choose your story's tone and watch as AI creates the perfect bedtime adventure
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-cream/90 text-lg mb-6">
            Want to save your stories and create more?
          </p>
          <Button 
            size="lg" 
            variant="outline"
            className="border-cream text-cream hover:bg-cream hover:text-navy px-8 py-4 text-lg shadow-xl"
            onClick={() => setShowAuthModal(true)}
          >
            Sign Up Free
          </Button>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Save Your Stories"
        description="Create an account to keep your stories safe and create unlimited stories!"
      />
    </div>
  );
}