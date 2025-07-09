import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Rocket, Crown, Heart, Star, Wand2 } from "lucide-react";

interface StoryLoadingModalProps {
  isOpen: boolean;
  onComplete?: () => void;
}

const loadingMessages = [
  { text: "Wrangling unicorns...", icon: Crown },
  { text: "Preparing rocket for launch...", icon: Rocket },
  { text: "Gathering magical stardust...", icon: Star },
  { text: "Teaching dragons to dance...", icon: Sparkles },
  { text: "Brewing rainbow soup...", icon: Heart },
  { text: "Collecting giggles from fairies...", icon: Wand2 },
  { text: "Painting clouds with imagination...", icon: Sparkles },
  { text: "Whispering secrets to the moon...", icon: Star },
  { text: "Tickling sleeping bears...", icon: Heart },
  { text: "Untangling spaghetti monsters...", icon: Crown },
  { text: "Polishing shooting stars...", icon: Sparkles },
  { text: "Training butterflies to sing...", icon: Wand2 },
  { text: "Organizing a teddy bear parade...", icon: Heart },
  { text: "Teaching penguins to fly...", icon: Rocket },
  { text: "Braiding mermaid hair...", icon: Star },
  { text: "Baking cookies with pixies...", icon: Crown },
  { text: "Racing snails on rainbows...", icon: Sparkles },
  { text: "Building castles in the clouds...", icon: Wand2 }
];

export function StoryLoadingModal({ isOpen, onComplete }: StoryLoadingModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentMessageIndex(0);
      return;
    }

    // Progress simulation - smoother increment
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // Stop at 95% until actual completion
        return prev + Math.random() * 3 + 1; // Random increment between 1-4
      });
    }, 800);

    // Complete progress when story generation finishes
    if (!isOpen && progress > 0) {
      setProgress(100);
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }

    // Message rotation - change every 2.5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        const nextIndex = (prev + 1) % loadingMessages.length;
        setCurrentMessage(loadingMessages[nextIndex]);
        return nextIndex;
      });
    }, 2500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [isOpen]);

  const IconComponent = currentMessage.icon;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-lavender/10 to-coral/10 border-2 border-coral/20 backdrop-blur-sm">
        <div className="text-center space-y-6 py-4">
          {/* Animated Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <IconComponent className="h-16 w-16 text-coral animate-bounce" />
              <Sparkles className="h-6 w-6 text-golden absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-2xl font-nunito font-bold text-navy mb-2">
              Creating Your Magical Story
            </h3>
            <p className="text-sm text-gray-600 font-nunito">
              Our storytelling wizards are hard at work...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <Progress 
              value={progress} 
              className="h-3 bg-cream border border-coral/20"
            />
            <div className="text-xs text-gray-500 font-nunito">
              {Math.round(progress)}% complete
            </div>
          </div>

          {/* Loading Message */}
          <div className="bg-white/50 rounded-xl p-4 border border-coral/10">
            <div className="flex items-center justify-center space-x-3">
              <IconComponent className="h-5 w-5 text-sunset animate-pulse" />
              <span className="text-navy font-nunito font-medium">
                {currentMessage.text}
              </span>
            </div>
          </div>

          {/* Fun Footer */}
          <div className="text-xs text-gray-500 font-nunito italic">
            ✨ Every great story begins with a little magic ✨
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}