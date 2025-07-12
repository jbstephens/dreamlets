import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { StoryDisplay } from "@/components/story-display";
import { useLocation } from "wouter";
import type { Story } from "@/lib/types";
import { Footer } from "@/components/footer";

export default function StoryView() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  console.log("StoryView: id =", id);

  const { data: story, isLoading, error } = useQuery<Story>({
    queryKey: [`/api/stories/${id}`],
    enabled: !!id,
  });

  console.log("StoryView: story =", story, "isLoading =", isLoading, "error =", error);

  const handleBack = () => {
    setLocation("/");
  };

  if (isLoading) {
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

  if (error || !story) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-nunito font-bold text-navy mb-4">Story not found</h1>
            <button
              onClick={handleBack}
              className="text-coral hover:underline"
            >
              Go back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StoryDisplay story={story} onBack={handleBack} />
      </div>
      <Footer />
    </div>
  );
}
