import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, ArrowLeft } from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender via-coral to-mint">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Button 
              variant="outline"
              className="border-cream text-cream hover:bg-cream hover:text-navy"
              onClick={() => window.location.href = "/"}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
          
          <h1 className="text-5xl font-bold text-cream mb-4 tracking-wide">
            Choose Your Plan
          </h1>
          <p className="text-xl text-cream/90 mb-8 max-w-2xl mx-auto">
            Create magical bedtime stories for your children with our flexible pricing options
          </p>
        </div>

        {/* Pricing */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
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
                <span>Personalized illustrations</span>
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

          {/* Dreamlets Premium Plan */}
          <Card className="bg-white/90 border-2 border-sunset relative">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-sunset text-white">
              Most Popular
            </Badge>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-navy">Dreamlets Premium</CardTitle>
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
                <span>Personalized illustrations</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span>Unlimited characters</span>
              </div>
              <Button 
                className="w-full mt-6 bg-sunset hover:bg-sunset/90" 
                onClick={() => window.location.href = "/api/login"}
              >
                Start Premium
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="text-center mt-16">
          <p className="text-cream/80 mb-8">
            All plans include beautiful personalized illustrations, custom stories, and the ability to save your creations.
          </p>
          <Button 
            variant="outline"
            className="border-cream text-cream hover:bg-cream hover:text-navy"
            onClick={() => window.location.href = "/"}
          >
            Start Creating Stories
          </Button>
        </div>
      </div>
    </div>
  );
}