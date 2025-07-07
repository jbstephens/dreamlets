import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { CharacterForm } from "@/components/character-form";
import { StoryForm } from "@/components/story-form";
import { StoryDisplay } from "@/components/story-display";
import { Button } from "@/components/ui/button";
import { History, Clock } from "lucide-react";
import type { Story } from "@/lib/types";

export default function Home() {
  const [selectedStoryId, setSelectedStoryId] = useState<number | null>(null);

  const { data: stories = [], isLoading: storiesLoading } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const { data: selectedStory, isLoading: storyLoading } = useQuery<Story>({
    queryKey: ["/api/stories", selectedStoryId],
    enabled: selectedStoryId !== null,
  });

  const handleStoryGenerated = (storyId: number) => {
    setSelectedStoryId(storyId);
  };

  const handleBackToHome = () => {
    setSelectedStoryId(null);
  };

  if (selectedStoryId && selectedStory) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StoryDisplay story={selectedStory} onBack={handleBackToHome} />
        </div>
      </div>
    );
  }

  if (storyLoading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
            <div className="h-64 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 no-print">
          <div className="relative mb-8">
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600"
              alt="Children reading colorful storybooks together"
              className="w-full h-64 object-cover rounded-2xl shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-coral/20 to-lavender/20 rounded-2xl"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-4xl md:text-5xl font-nunito font-bold mb-4">Create Magic Together</h2>
                <p className="text-xl md:text-2xl font-light">AI-powered bedtime stories personalized for your little ones</p>
              </div>
            </div>
          </div>
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
                <div
                  key={story.id}
                  onClick={() => setSelectedStoryId(story.id)}
                  className="bg-gradient-to-br from-coral/5 to-sunset/5 rounded-xl p-4 border border-coral/10 hover:shadow-lg transition-shadow cursor-pointer"
                >
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
