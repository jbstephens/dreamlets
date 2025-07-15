import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Moon, Stars, Sparkles, Heart, BookOpen, Palette, Crown, Check } from "lucide-react";
import { useLocation } from "wouter";
import { AuthModal } from "@/components/auth-modal";
import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/analytics";
import { Footer } from "@/components/footer";

const sampleStories = [
  {
    id: '1',
    title: 'Emma and the Dancing Dragon',
    text: 'Emma was playing in her garden when she noticed something magical behind the rose bushes. A small, friendly dragon with shimmering purple scales was practicing dance moves!',
    imageUrl: '/sample-emma-dragon.png?v=' + Date.now()
  },
  {
    id: '2', 
    title: 'Max\'s Pirate Adventure',
    text: 'Captain Max stood proudly on his ship\'s deck, his parrot friend Squawk perched on his shoulder. Together they sailed under the starry sky, following their treasure map to a mysterious island filled with wonders!',
    imageUrl: '/sample-max-pirate.png?v=' + Date.now()
  },
  {
    id: '3',
    title: 'Luna\'s Dream Kingdom',
    text: 'Luna floated gently through the clouds, surrounded by glowing star creatures who giggled and danced around her. In this magical kingdom above the clouds, every wish could come true!',
    imageUrl: '/sample-luna-clouds.png?v=' + Date.now()
  }
];

export default function Landing() {
  const [location, navigate] = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  
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
              onClick={() => {
                trackEvent('cta_click', 'engagement', 'create_story_hero');
                navigate("/create");
              }}
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

      </div>

      {/* Sample Stories Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">See Sample Stories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Here's how your personalized bedtime stories might look
            </p>
          </div>
          
          {/* Story Navigation */}
          <div className="flex justify-center mb-8 space-x-4">
            {sampleStories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStoryIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentStoryIndex === index ? 'bg-coral' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-lavender/10 to-coral/10 border-coral/20">
              <CardHeader>
                <CardTitle className="text-2xl text-navy text-center">
                  {sampleStories[currentStoryIndex].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="bg-gradient-to-br from-sunset/20 to-golden/20 p-6 rounded-xl">
                    <p className="text-gray-700">
                      "{sampleStories[currentStoryIndex].text}"
                    </p>
                  </div>
                  <div className="bg-mint/20 p-4 rounded-xl h-80 flex items-center justify-center overflow-hidden">
                    <img 
                      src={sampleStories[currentStoryIndex].imageUrl} 
                      alt={`Sample story illustration for ${sampleStories[currentStoryIndex].title}`}
                      className="w-full h-full object-contain rounded-lg"

                    />
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    variant="outline"
                    onClick={() => setCurrentStoryIndex((prev) => (prev + 1) % sampleStories.length)}
                    className="text-coral border-coral hover:bg-coral hover:text-white mr-4"
                  >
                    See Next Sample
                  </Button>
                  <Button 
                    size="lg" 
                    className="bg-coral hover:bg-coral/90 text-white font-semibold"
                    onClick={() => {
                      trackEvent('cta_click', 'engagement', 'try_now_sample');
                      navigate("/create");
                    }}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Create Your Story
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-br from-mint/30 to-lavender/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create a magical story in just a few simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="bg-coral text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <CardTitle className="text-navy">Add Kids</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Tell us about your kids - their names, ages, and what they love. 
                  The more details, the more personalized the story!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="bg-lavender text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <CardTitle className="text-navy">Add Characters</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Create recurring characters like beloved pets, favorite stuffed animals, 
                  or imaginary friends to appear in your stories.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="bg-sunset text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <CardTitle className="text-navy">Share Your Idea</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  What kind of adventure should they have? Dragons, space travel, 
                  magical forests - anything your child dreams about!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm text-center">
              <CardHeader>
                <div className="bg-golden text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <CardTitle className="text-navy">Enjoy the Magic</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Watch as we create a beautiful 3-page story with custom illustrations 
                  featuring your child as the hero!
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-coral text-white hover:bg-coral/90 px-8 py-4 text-lg shadow-xl"
              onClick={() => {
                trackEvent('cta_click', 'engagement', 'try_now_how_it_works');
                navigate("/create");
              }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Try It Now!
            </Button>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">Simple Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade when you want unlimited stories
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <Card className="bg-white border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-navy">Free</CardTitle>
                <div className="text-4xl font-bold text-navy">$0</div>
                <CardDescription>Perfect for trying Dreamlets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>3 free stories</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Custom illustrations</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Personalized characters</span>
                </div>
                <Button 
                  className="w-full mt-6" 
                  variant="outline"
                  onClick={() => {
                    trackEvent('cta_click', 'pricing', 'free_plan');
                    navigate("/create");
                  }}
                >
                  Start Free
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-gradient-to-br from-coral/10 to-sunset/10 border-2 border-coral relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-coral text-white">
                Most Popular
              </Badge>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-navy">Premium</CardTitle>
                <div className="text-4xl font-bold text-navy">$5.99</div>
                <CardDescription>per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span className="font-semibold">Unlimited stories</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Save all your stories</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center">
                  <Crown className="h-5 w-5 text-golden mr-3" />
                  <span>Premium features</span>
                </div>
                <Button 
                  className="w-full mt-6 bg-coral text-white hover:bg-coral/90" 
                  onClick={() => {
                    trackEvent('cta_click', 'pricing', 'premium_plan');
                    setShowAuthModal(true);
                  }}
                >
                  Start Premium
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-lavender via-coral to-mint py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-cream mb-4">Ready to Create Magic?</h2>
          <p className="text-xl text-cream/90 mb-8 max-w-2xl mx-auto">
            Join thousands of families creating personalized bedtime stories
          </p>
          <Button 
            size="lg" 
            className="bg-sunset text-white hover:bg-sunset/90 px-8 py-4 text-lg shadow-xl"
            onClick={() => {
              trackEvent('cta_click', 'engagement', 'final_cta');
              navigate("/create");
            }}
          >
            <Heart className="mr-2 h-5 w-5" />
            Create Your First Story
          </Button>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Save Your Stories"
        description="Create an account to keep your stories safe and create unlimited stories!"
      />
      <Footer />
    </div>
  );
}