
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Story } from "@/lib/types";

interface StoryDisplayProps {
  story: Story;
  onBack: () => void;
}

export function StoryDisplay({ story, onBack }: StoryDisplayProps) {
  console.log("StoryDisplay received story:", story);
  
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
              <img
                src={story.imageUrl1}
                alt="Story illustration - Chapter 1"
                className="w-full h-80 object-cover rounded-xl shadow-lg"
              />
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
              <img
                src={story.imageUrl2}
                alt="Story illustration - Chapter 2"
                className="w-full h-80 object-cover rounded-xl shadow-lg"
              />
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
              <img
                src={story.imageUrl3}
                alt="Story illustration - Chapter 3"
                className="w-full h-80 object-cover rounded-xl shadow-lg"
              />
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
    </div>
  );
}
