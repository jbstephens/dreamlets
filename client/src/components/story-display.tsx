
import { Printer, ArrowLeft, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import type { Story } from "@/lib/types";

interface StoryDisplayProps {
  story: Story;
  onBack: () => void;
}

export function StoryDisplay({ story, onBack }: StoryDisplayProps) {
  console.log("StoryDisplay received story:", story);
  const { isAuthenticated } = useAuth();
  
  const handlePrint = () => {
    window.print();
  };

  if (!story) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <h3 className="text-xl font-nunito font-bold text-navy mb-4">Story not available</h3>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stories
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden" id="story-display">
      {/* Story Header */}
      <div className="bg-gradient-to-r from-coral to-sunset p-6 text-white no-print">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/20 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h3 className="text-2xl font-nunito font-bold mb-2">{story.title}</h3>
              <p className="text-white/90">A {story.tone} story</p>
            </div>
          </div>
          <Button
            onClick={handlePrint}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Story
          </Button>
        </div>
      </div>

      {/* Story Pages */}
      <div className="story-content">
        {/* Page 1 */}
        <div className="story-page print-page p-8 min-h-screen flex flex-col">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-crimson font-bold text-navy mb-2">{story.title}</h1>
            <p className="text-lg font-nunito text-gray-600">Chapter 1: The Beginning</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center mb-8">
            <div className="relative w-full">
              {story.imageUrl1 ? (
                <img
                  src={story.imageUrl1}
                  alt="Story illustration - Chapter 1"
                  className="w-full rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-lavender to-mint rounded-xl shadow-lg flex items-center justify-center">
                  <p className="text-navy/60 text-lg">Story illustration - Chapter 1</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg font-crimson leading-relaxed text-navy whitespace-pre-wrap">
              {story.storyPart1}
            </p>
          </div>
          
          <div className="text-center mt-8">
            <span className="text-2xl font-nunito font-bold text-coral">1</span>
          </div>
        </div>

        {/* Page 2 */}
        <div className="story-page print-page p-8 min-h-screen flex flex-col">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-crimson font-bold text-navy mb-2">{story.title}</h1>
            <p className="text-lg font-nunito text-gray-600">Chapter 2: The Adventure</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center mb-8">
            <div className="relative w-full">
              {story.imageUrl2 ? (
                <img
                  src={story.imageUrl2}
                  alt="Story illustration - Chapter 2"
                  className="w-full rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-coral to-sunset rounded-xl shadow-lg flex items-center justify-center">
                  <p className="text-white/80 text-lg">Story illustration - Chapter 2</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg font-crimson leading-relaxed text-navy whitespace-pre-wrap">
              {story.storyPart2}
            </p>
          </div>
          
          <div className="text-center mt-8">
            <span className="text-2xl font-nunito font-bold text-coral">2</span>
          </div>
        </div>

        {/* Page 3 */}
        <div className="story-page p-8 min-h-screen flex flex-col">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-crimson font-bold text-navy mb-2">{story.title}</h1>
            <p className="text-lg font-nunito text-gray-600">Chapter 3: The Happy Ending</p>
          </div>
          
          <div className="flex-1 flex items-center justify-center mb-8">
            <div className="relative w-full">
              {story.imageUrl3 ? (
                <img
                  src={story.imageUrl3}
                  alt="Story illustration - Chapter 3"
                  className="w-full rounded-xl shadow-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gradient-to-br from-mint to-golden rounded-xl shadow-lg flex items-center justify-center">
                  <p className="text-navy/60 text-lg">Story illustration - Chapter 3</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg font-crimson leading-relaxed text-navy whitespace-pre-wrap">
              {story.storyPart3}
            </p>
          </div>
          
          <div className="text-center mt-8">
            <span className="text-2xl font-nunito font-bold text-coral">3</span>
            <p className="text-sm font-nunito text-gray-500 mt-2">The End</p>
          </div>
        </div>
      </div>

      {/* Account Creation Stripe for Non-Logged In Users */}
      {!isAuthenticated && (
        <div className="no-print bg-gradient-to-r from-coral via-sunset to-golden p-6 border-t-4 border-lavender">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-cream mr-2 animate-pulse" />
              <Sparkles className="h-5 w-5 text-cream mr-3" />
              <h3 className="text-2xl font-nunito font-bold text-cream">
                Love this story?
              </h3>
              <Sparkles className="h-5 w-5 text-cream ml-3" />
              <Heart className="h-6 w-6 text-cream ml-2 animate-pulse" />
            </div>
            <p className="text-lg text-cream/90 mb-6 max-w-2xl mx-auto">
              Create an account to save this magical story forever and unlock up to 5 total stories per month completely free!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => window.location.href = "/register"}
                className="bg-cream text-coral hover:bg-cream/90 font-nunito font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Heart className="h-5 w-5 mr-2" />
                Create Account & Save Story
              </Button>
              <p className="text-cream/80 text-sm font-nunito">
                No credit card required • Free account • Instant access
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
