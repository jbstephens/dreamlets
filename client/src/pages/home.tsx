
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Navbar } from "@/components/navbar";
import { CharacterForm } from "@/components/character-form";
import { StoryForm } from "@/components/story-form";
import { SubscriptionStatus } from "@/components/subscription-status";
import { Button } from "@/components/ui/button";
import { History, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Story } from "@/lib/types";

export default function Home() {
  const { user } = useAuth();
  const { data: stories = [], isLoading: storiesLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const handleStoryGenerated = (storyId: number) => {
    // Story will be available in the stories list, no need to handle locally
    // The user can click on it to view
  };

  // Calculate stories used this month for subscription status
  const now = new Date();
  const thisMonthStories = stories.filter(story => {
    const storyDate = new Date(story.createdAt || '');
    return storyDate.getMonth() === now.getMonth() && storyDate.getFullYear() === now.getFullYear();
  });

  const getStoriesLimit = () => {
    if (!user) return 5;
    switch (user.subscriptionTier) {
      case "premium_15": return 15;
      case "premium_unlimited": return Infinity;
      default: return 5;
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 no-print">
          <div className="relative mb-8 bg-gradient-to-br from-lavender via-coral to-mint rounded-3xl p-12 overflow-hidden">
            {/* Floating decorative elements */}
            <div className="absolute top-4 left-8 text-3xl animate-bounce">🌟</div>
            <div className="absolute top-8 right-12 text-2xl animate-pulse delay-500">🦋</div>
            <div className="absolute bottom-6 left-12 text-2xl animate-bounce delay-1000">🌙</div>
            <div className="absolute bottom-4 right-8 text-3xl animate-pulse delay-300">✨</div>
            <div className="absolute top-16 left-1/4 text-xl animate-bounce delay-700">⭐</div>
            <div className="absolute bottom-12 right-1/4 text-2xl animate-pulse delay-200">🎈</div>
            
            <div className="relative z-10">
              <div className="mb-8 flex justify-center space-x-4">
                <div className="bg-cream p-4 rounded-full shadow-xl transform rotate-12 animate-bounce">
                  <div className="text-4xl">🌙</div>
                </div>
                <div className="bg-white p-4 rounded-full shadow-xl transform -rotate-12 animate-bounce delay-200">
                  <div className="text-4xl">📖</div>
                </div>
                <div className="bg-sunset p-4 rounded-full shadow-xl transform rotate-6 animate-bounce delay-500">
                  <div className="text-4xl">✨</div>
                </div>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-nunito font-bold mb-6 text-navy drop-shadow-2xl">
                Where Dreams Come to Life! 
              </h2>
              <p className="text-xl md:text-2xl font-medium mb-6 max-w-4xl mx-auto leading-relaxed text-navy">
                🎭 Create magical personalized bedtime stories with your little ones as the heroes! 
              </p>
              <p className="text-lg md:text-xl text-navy/80 mb-8">
                🎨 Beautiful AI illustrations bring every adventure to life
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 text-navy text-lg font-medium">
                <div className="flex items-center bg-white/90 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                  <span className="text-2xl mr-2">🦄</span>
                  Unicorns & Dragons
                </div>
                <div className="flex items-center bg-white/90 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                  <span className="text-2xl mr-2">🏰</span>
                  Castles & Adventures  
                </div>
                <div className="flex items-center bg-white/90 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                  <span className="text-2xl mr-2">🌈</span>
                  Rainbow Quests
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="mb-8">
          <SubscriptionStatus 
            storiesUsed={thisMonthStories.length} 
            limit={getStoriesLimit()} 
          />
        </div>

        {/* Character Setup */}
        <CharacterForm />

        {/* Story Generation Form */}
        <StoryForm onStoryGenerated={handleStoryGenerated} />

        {/* Story History */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 no-print">
          <h3 className="text-2xl font-nunito font-bold text-navy mb-6 flex items-center">
            <History className="h-6 w-6 text-coral mr-3" />
            Recent Stories
          </h3>
          
          {storiesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Clock className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-600 font-nunito">No stories yet. Create your first magical adventure!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <Link href={`/story/${story.id}`} key={story.id}>
                  <div className="bg-gradient-to-br from-coral/5 to-sunset/5 rounded-xl p-4 border border-coral/10 hover:shadow-lg transition-shadow cursor-pointer">
                    {story.imageUrl1 && (
                      <img
                        src={story.imageUrl1}
                        alt={`${story.title} illustration`}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h4 className="font-nunito font-semibold text-navy mb-2">{story.title}</h4>
                    <p className="text-sm text-gray-600 mb-2 capitalize">{story.tone} story</p>
                    <p className="text-xs text-gray-500">
                      {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : "Recently created"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-white py-8 mt-16 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-6 w-6 text-coral mr-3">📚</div>
            <h3 className="text-xl font-nunito font-bold">Dreamlets</h3>
          </div>
          <p className="text-gray-300 mb-4">Creating magical bedtime stories, one adventure at a time.</p>
        </div>
      </footer>
    </div>
  );
}
