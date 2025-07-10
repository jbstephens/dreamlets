import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Crown, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [, navigate] = useLocation();

  const handleUpgrade = () => {
    onClose();
    navigate("/pricing");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-lavender via-coral to-sunset border-0 shadow-2xl">
        <DialogHeader>
          <div className="text-center space-y-4">
            {/* Animated celebration icons */}
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-cream animate-bounce" />
              <Sparkles className="h-10 w-10 text-golden animate-pulse" />
              <Heart className="h-8 w-8 text-cream animate-bounce delay-200" />
            </div>
            
            <DialogTitle className="text-3xl font-nunito font-bold text-cream">
              Welcome to Dreamlets! 🎉
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="text-center space-y-6 py-4">
          <p className="text-lg text-cream/90 leading-relaxed">
            Thanks for creating your account! Your story has been saved forever and you can now create up to 
            <span className="font-bold text-golden"> 5 magical stories per month</span> completely free!
          </p>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="h-5 w-5 text-golden" />
              <span className="text-cream font-nunito font-semibold">Your Free Plan Includes:</span>
              <Sparkles className="h-5 w-5 text-golden" />
            </div>
            <ul className="text-cream/90 space-y-2">
              <li>✨ 5 personalized stories per month</li>
              <li>🎨 Beautiful custom illustrations</li>
              <li>📚 Story library that saves forever</li>
              <li>🖨️ Print-ready story pages</li>
            </ul>
          </div>
          
          <p className="text-cream/80 text-sm">
            Want even more magical adventures?
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-cream text-cream hover:bg-cream hover:text-coral font-nunito font-semibold"
            >
              Start Creating Stories
            </Button>
            <Button
              onClick={handleUpgrade}
              className="bg-golden text-navy hover:bg-golden/90 font-nunito font-bold shadow-lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              View Premium Plans
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}