import { useState } from "react";
import { Sparkles, Baby, Cat, Leaf, Smile, Mountain, Cloud } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { StoryLoadingModal } from "@/components/story-loading-modal";
import type { Kid, Character, GenerateStoryRequest } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

interface StoryFormProps {
  onStoryGenerated: (storyId: number) => void;
}

export function StoryForm({ onStoryGenerated }: StoryFormProps) {
  const [selectedKids, setSelectedKids] = useState<number[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<number[]>([]);
  const [storyIdea, setStoryIdea] = useState("");
  const [selectedTone, setSelectedTone] = useState("cozy");
  const { toast } = useToast();

  const { data: kids = [] } = useQuery<Kid[]>({
    queryKey: ["/api/kids"],
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const generateStoryMutation = useMutation({
    mutationFn: async (request: GenerateStoryRequest) => {
      const response = await apiRequest("POST", "/api/stories/generate", request);
      return response.json();
    },
    onSuccess: (story) => {
      // Track successful story generation
      trackEvent('story_generated', 'content', 'story_creation_completed');
      
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      onStoryGenerated(story.id);
      toast({ title: "Story generated successfully!" });
    },
    onError: (error: any) => {
      console.error("Error generating story:", error);
      
      // Check if this is a guest limit error
      if (error.message?.includes("3 free story limit")) {
        toast({ 
          title: "Free Story Limit Reached", 
          description: "You've created 3 free stories! Create an account to continue with unlimited stories.",
          variant: "destructive" 
        });
      } else if (error.message?.includes("one story as a guest")) {
        toast({ 
          title: "Guest Story Limit Reached", 
          description: "Sign up to create more stories!",
          variant: "destructive" 
        });
      } else {
        toast({ title: "Failed to generate story", variant: "destructive" });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedKids.length === 0) {
      toast({ title: "Please select at least one child", variant: "destructive" });
      return;
    }
    if (!storyIdea.trim()) {
      toast({ title: "Please enter a story idea", variant: "destructive" });
      return;
    }

    generateStoryMutation.mutate({
      kidIds: selectedKids,
      characterIds: selectedCharacters,
      storyIdea: storyIdea.trim(),
      tone: selectedTone,
    });
  };

  const toggleKid = (kidId: number) => {
    setSelectedKids(prev => 
      prev.includes(kidId) 
        ? prev.filter(id => id !== kidId)
        : [...prev, kidId]
    );
  };

  const toggleCharacter = (characterId: number) => {
    setSelectedCharacters(prev => 
      prev.includes(characterId) 
        ? prev.filter(id => id !== characterId)
        : [...prev, characterId]
    );
  };

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case "cozy":
        return <Leaf className="h-6 w-6" />;
      case "funny":
        return <Smile className="h-6 w-6" />;
      case "adventure":
        return <Mountain className="h-6 w-6" />;
      case "dreamy":
        return <Cloud className="h-6 w-6" />;
      default:
        return <Leaf className="h-6 w-6" />;
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case "cozy":
        return "mint";
      case "funny":
        return "golden";
      case "adventure":
        return "sunset";
      case "dreamy":
        return "lavender";
      default:
        return "mint";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 no-print">
      <h3 className="text-2xl font-nunito font-bold text-navy mb-6 flex items-center">
        <Sparkles className="h-6 w-6 text-coral mr-3" />
        Create New Story
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Select Kids */}
        <div>
          <label className="block text-sm font-nunito font-semibold text-navy mb-3">
            Who is this story for?
          </label>
          <div className="flex flex-wrap gap-3">
            {kids.map((kid) => (
              <div
                key={kid.id}
                onClick={() => toggleKid(kid.id)}
                className={`px-4 py-2 rounded-full border-2 cursor-pointer transition-all ${
                  selectedKids.includes(kid.id)
                    ? "bg-coral/10 border-coral text-coral"
                    : "bg-gray-100 border-transparent hover:border-mint"
                }`}
              >
                <Baby className="h-4 w-4 mr-2 inline" />
                <span className="font-nunito">{kid.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Select Characters */}
        <div>
          <label className="block text-sm font-nunito font-semibold text-navy mb-3">
            Include characters (optional)
          </label>
          <div className="flex flex-wrap gap-3">
            {characters.map((character) => (
              <div
                key={character.id}
                onClick={() => toggleCharacter(character.id)}
                className={`px-4 py-2 rounded-full border-2 cursor-pointer transition-all ${
                  selectedCharacters.includes(character.id)
                    ? "bg-lavender/10 border-lavender text-lavender"
                    : "bg-gray-100 border-transparent hover:border-mint"
                }`}
              >
                <Cat className="h-4 w-4 mr-2 inline" />
                <span className="font-nunito">{character.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Story Idea */}
        <div>
          <label className="block text-sm font-nunito font-semibold text-navy mb-3">
            Story idea
          </label>
          <Textarea
            value={storyIdea}
            onChange={(e) => setStoryIdea(e.target.value)}
            placeholder="What adventure should we create today? (e.g., 'A magical journey to find the lost rainbow')"
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coral focus:border-transparent resize-none"
            rows={3}
            required
          />
        </div>

        {/* Story Tone */}
        <div>
          <label className="block text-sm font-nunito font-semibold text-navy mb-3">
            Story tone
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "cozy", label: "Cozy" },
              { value: "funny", label: "Funny" },
              { value: "adventure", label: "Adventure" },
              { value: "dreamy", label: "Dreamy" },
            ].map((tone) => (
              <div
                key={tone.value}
                onClick={() => setSelectedTone(tone.value)}
                className={`p-3 rounded-xl border-2 cursor-pointer text-center transition-all ${
                  selectedTone === tone.value
                    ? `bg-${getToneColor(tone.value)}/10 border-${getToneColor(tone.value)}`
                    : "bg-gray-100 border-transparent hover:border-golden"
                }`}
              >
                <div className={`${selectedTone === tone.value ? `text-${getToneColor(tone.value)}` : "text-gray-400"} mb-2`}>
                  {getToneIcon(tone.value)}
                </div>
                <p className="font-nunito font-medium">{tone.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <Button
            type="submit"
            disabled={generateStoryMutation.isPending}
            className="bg-gradient-to-r from-coral to-sunset text-white px-8 py-4 rounded-full font-nunito font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate My Story
            </>
          </Button>
        </div>
      </form>

      {/* Loading Modal */}
      <StoryLoadingModal isOpen={generateStoryMutation.isPending} />
    </div>
  );
}
