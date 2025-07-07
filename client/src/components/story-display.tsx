import { useState } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Story } from "@/lib/types";

interface StoryDisplayProps {
  story: Story;
  onBack: () => void;
}

export function StoryDisplay({ story, onBack }: StoryDisplayProps) {
  const [imageLoadingStates, setImageLoadingStates] = useState({
    image1: true,
    image2: true,
    image3: true
  });
  const [imageErrors, setImageErrors] = useState({
    image1: false,
    image2: false,
    image3: false
  });

  const handlePrint = () => {
    window.print();
  };

  const handleImageLoad = (imageKey: keyof typeof imageLoadingStates) => {
    setImageLoadingStates(prev => ({ ...prev, [imageKey]: false }));
  };

  const handleImageError = (imageKey: keyof typeof imageErrors) => {
    setImageLoadingStates(prev => ({ ...prev, [imageKey]: false }));
    setImageErrors(prev => ({ ...prev, [imageKey]: true }));
  };

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
            {story.imageUrl1 ? (
              <div className="relative w-full max-w-lg">
                {imageLoadingStates.image1 && (
                  <div className="absolute inset-0 w-full h-64 bg-gradient-to-br from-coral/20 to-sunset/20 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-coral border-t-transparent rounded-full mx-auto mb-2"></div>
                      <span className="text-coral font-medium">Loading magical illustration...</span>
                    </div>
                  </div>
                )}
                {!imageErrors.image1 && (
                  <img
                    src={story.imageUrl1}
                    alt="Story illustration - Chapter 1"
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                    onLoad={() => handleImageLoad('image1')}
                    onError={() => handleImageError('image1')}
                    style={{ display: imageLoadingStates.image1 ? 'none' : 'block' }}
                  />
                )}
                {imageErrors.image1 && (
                  <div className="w-full h-64 bg-gradient-to-br from-coral/10 to-sunset/10 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">🎨</span>
                      <span className="text-coral font-medium">Illustration temporarily unavailable</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full max-w-lg h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">📖</span>
                  <span className="text-gray-500">No illustration available</span>
                </div>
              </div>
            )}
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
            {story.imageUrl2 ? (
              <div className="relative w-full max-w-lg">
                {imageLoadingStates.image2 && (
                  <div className="absolute inset-0 w-full h-64 bg-gradient-to-br from-lavender/20 to-mint/20 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-lavender border-t-transparent rounded-full mx-auto mb-2"></div>
                      <span className="text-lavender font-medium">Loading magical illustration...</span>
                    </div>
                  </div>
                )}
                {!imageErrors.image2 && (
                  <img
                    src={story.imageUrl2}
                    alt="Story illustration - Chapter 2"
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                    onLoad={() => handleImageLoad('image2')}
                    onError={() => handleImageError('image2')}
                    style={{ display: imageLoadingStates.image2 ? 'none' : 'block' }}
                  />
                )}
                {imageErrors.image2 && (
                  <div className="w-full h-64 bg-gradient-to-br from-lavender/10 to-mint/10 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">🎨</span>
                      <span className="text-lavender font-medium">Illustration temporarily unavailable</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full max-w-lg h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">📖</span>
                  <span className="text-gray-500">No illustration available</span>
                </div>
              </div>
            )}
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
            {story.imageUrl3 ? (
              <div className="relative w-full max-w-lg">
                {imageLoadingStates.image3 && (
                  <div className="absolute inset-0 w-full h-64 bg-gradient-to-br from-mint/20 to-golden/20 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-mint border-t-transparent rounded-full mx-auto mb-2"></div>
                      <span className="text-mint font-medium">Loading magical illustration...</span>
                    </div>
                  </div>
                )}
                {!imageErrors.image3 && (
                  <img
                    src={story.imageUrl3}
                    alt="Story illustration - Chapter 3"
                    className="w-full h-64 object-cover rounded-xl shadow-lg"
                    onLoad={() => handleImageLoad('image3')}
                    onError={() => handleImageError('image3')}
                    style={{ display: imageLoadingStates.image3 ? 'none' : 'block' }}
                  />
                )}
                {imageErrors.image3 && (
                  <div className="w-full h-64 bg-gradient-to-br from-mint/10 to-golden/10 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">🎨</span>
                      <span className="text-mint font-medium">Illustration temporarily unavailable</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full max-w-lg h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">📖</span>
                  <span className="text-gray-500">No illustration available</span>
                </div>
              </div>
            )}
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
