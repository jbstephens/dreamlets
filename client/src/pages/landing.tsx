import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Stars, Sparkles, Heart, BookOpen, Palette, Crown, Check } from "lucide-react";

export default function Landing() {
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
            Create magical, personalized bedtime stories for your children with AI-powered illustrations and storytelling
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-sunset text-white hover:bg-sunset/90 px-8 py-4 text-lg shadow-xl"
              onClick={() => window.location.href = "/guest"}
            >
              <Heart className="mr-2 h-5 w-5" />
              Try Free Story
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-cream text-cream hover:bg-cream hover:text-navy px-8 py-4 text-lg shadow-xl"
              onClick={() => window.location.href = "/api/login"}
            >
              Sign Up Free
            </Button>
          </div>
          <p className="text-cream/80 text-sm mt-4">Create one story as a guest, or sign up for 5 free stories</p>
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
              <CardTitle className="text-cream">AI Illustrations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-cream/80">
                Beautiful, AI-generated images bring every story to life with stunning visuals
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

        {/* Pricing */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-cream mb-8">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            
            {/* Free Plan */}
            <Card className="bg-white/90 border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-navy">Free</CardTitle>
                <div className="text-4xl font-bold text-navy">$0</div>
                <CardDescription>Perfect for trying out Dreamlets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Up to 5 stories total</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>AI-generated illustrations</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Personalized characters</span>
                </div>
                <Button 
                  className="w-full mt-6" 
                  variant="outline"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Premium 15 Plan */}
            <Card className="bg-white/90 border-2 border-sunset relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-sunset text-white">
                Most Popular
              </Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-navy">Premium</CardTitle>
                <div className="text-4xl font-bold text-navy">$19.99</div>
                <CardDescription>per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>15 stories per month</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>AI-generated illustrations</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Unlimited characters</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Priority support</span>
                </div>
                <Button 
                  className="w-full mt-6 bg-sunset hover:bg-sunset/90" 
                  onClick={() => window.location.href = "/api/login"}
                >
                  Start Premium
                </Button>
              </CardContent>
            </Card>

            {/* Unlimited Plan */}
            <Card className="bg-white/90 border-2 border-golden">
              <CardHeader className="text-center">
                <Crown className="h-8 w-8 text-golden mx-auto mb-2" />
                <CardTitle className="text-2xl text-navy">Unlimited</CardTitle>
                <div className="text-4xl font-bold text-navy">$29.99</div>
                <CardDescription>per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="font-semibold">Unlimited stories</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>AI-generated illustrations</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Unlimited characters</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Premium support</span>
                </div>
                <Button 
                  className="w-full mt-6 bg-golden hover:bg-golden/90 text-navy" 
                  onClick={() => window.location.href = "/api/login"}
                >
                  Go Unlimited
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-cream/90 text-lg mb-6">
            Ready to create magical bedtime stories?
          </p>
          <Button 
            size="lg" 
            className="bg-white text-sunset hover:bg-white/90 px-8 py-4 text-lg shadow-xl"
            onClick={() => window.location.href = "/api/login"}
          >
            Sign In with Replit
          </Button>
        </div>
      </div>
    </div>
  );
}