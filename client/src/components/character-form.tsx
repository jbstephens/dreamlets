import { useState } from "react";
import { Plus, X, Baby, Cat, Crown } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Kid, Character } from "@/lib/types";

export function CharacterForm() {
  const [isKidDialogOpen, setIsKidDialogOpen] = useState(false);
  const [isCharacterDialogOpen, setIsCharacterDialogOpen] = useState(false);
  const [kidForm, setKidForm] = useState({ name: "", age: "", description: "" });
  const [characterForm, setCharacterForm] = useState({ name: "", type: "manual", description: "" });
  const { toast } = useToast();

  const { data: kids = [], isLoading: kidsLoading } = useQuery<Kid[]>({
    queryKey: ["/api/kids"],
  });

  const { data: characters = [], isLoading: charactersLoading } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const createKidMutation = useMutation({
    mutationFn: async (kid: { name: string; age: number; description?: string }) => {
      const response = await apiRequest("POST", "/api/kids", kid);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kids"] });
      setIsKidDialogOpen(false);
      setKidForm({ name: "", age: "", description: "" });
      toast({ title: "Kid added successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to add kid", variant: "destructive" });
    },
  });

  const createCharacterMutation = useMutation({
    mutationFn: async (character: { name: string; type: string; description?: string }) => {
      const response = await apiRequest("POST", "/api/characters", character);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      setIsCharacterDialogOpen(false);
      setCharacterForm({ name: "", type: "manual", description: "" });
      toast({ title: "Character added successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to add character", variant: "destructive" });
    },
  });

  const deleteKidMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/kids/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kids"] });
      toast({ title: "Kid removed successfully!" });
    },
  });

  const deleteCharacterMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/characters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      toast({ title: "Character removed successfully!" });
    },
  });

  const handleKidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (kidForm.name && kidForm.age) {
      createKidMutation.mutate({
        name: kidForm.name,
        age: parseInt(kidForm.age),
        description: kidForm.description || undefined,
      });
    }
  };

  const handleCharacterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (characterForm.name && characterForm.type) {
      createCharacterMutation.mutate({
        name: characterForm.name,
        type: characterForm.type,
        description: characterForm.description || undefined,
      });
    }
  };

  const getCharacterIcon = (type: string) => {
    switch (type) {
      case "cat":
        return <Cat className="h-4 w-4" />;
      case "dragon":
        return <Crown className="h-4 w-4" />;
      default:
        return <Baby className="h-4 w-4" />;
    }
  };

  if (kidsLoading || charactersLoading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-2xl"></div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 no-print">
      <h3 className="text-2xl font-nunito font-bold text-navy mb-6 flex items-center">
        <Baby className="h-6 w-6 text-coral mr-3" />
        Your Characters
      </h3>

      {/* Kids Section */}
      <div className="mb-8">
        <h4 className="text-lg font-nunito font-semibold text-navy mb-4">Kids</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {kids.map((kid) => (
            <div key={kid.id} className="bg-gradient-to-br from-coral/10 to-sunset/10 p-4 rounded-xl border border-coral/20 relative group">
              <button
                onClick={() => deleteKidMutation.mutate(kid.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
              </button>
              <div className="flex items-center mb-2">
                <Baby className="h-4 w-4 text-coral mr-2" />
                <span className="font-nunito font-semibold">{kid.name}, age {kid.age}</span>
              </div>
              {kid.description && (
                <p className="text-sm text-gray-600">{kid.description}</p>
              )}
            </div>
          ))}
          
          <Dialog open={isKidDialogOpen} onOpenChange={setIsKidDialogOpen}>
            <DialogTrigger asChild>
              <div className="bg-gradient-to-br from-golden/10 to-sunset/10 p-4 rounded-xl border border-golden/20 flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow">
                <Plus className="h-4 w-4 text-golden mr-2" />
                <span className="font-nunito font-medium text-golden">Add Child</span>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Child</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleKidSubmit} className="space-y-4">
                <Input
                  placeholder="Child's name"
                  value={kidForm.name}
                  onChange={(e) => setKidForm({ ...kidForm, name: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  placeholder="Age"
                  value={kidForm.age}
                  onChange={(e) => setKidForm({ ...kidForm, age: e.target.value })}
                  required
                  min="1"
                  max="12"
                />
                <Textarea
                  placeholder="Short description (e.g., 'Loves space and dinosaurs')"
                  value={kidForm.description}
                  onChange={(e) => setKidForm({ ...kidForm, description: e.target.value })}
                />
                <Button type="submit" className="w-full" disabled={createKidMutation.isPending}>
                  {createKidMutation.isPending ? "Adding..." : "Add Child"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Characters Section */}
      <div className="mb-6">
        <h4 className="text-lg font-nunito font-semibold text-navy mb-4">Recurring Characters</h4>
        <div className="flex flex-wrap gap-3 mb-4">
          {characters.map((character) => (
            <div key={character.id} className="bg-lavender/10 px-4 py-2 rounded-full border border-lavender/20 flex items-center group">
              {getCharacterIcon(character.type)}
              <span className="font-nunito ml-2">{character.name}</span>
              <button
                onClick={() => deleteCharacterMutation.mutate(character.id)}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-gray-500 hover:text-red-500" />
              </button>
            </div>
          ))}
          
          <Dialog open={isCharacterDialogOpen} onOpenChange={setIsCharacterDialogOpen}>
            <DialogTrigger asChild>
              <div className="bg-golden/10 px-4 py-2 rounded-full border border-golden/20 flex items-center cursor-pointer hover:shadow-md transition-shadow">
                <Plus className="h-4 w-4 text-golden mr-2" />
                <span className="font-nunito text-golden">Add Character</span>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Character</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCharacterSubmit} className="space-y-4">
                <Input
                  placeholder="Character name"
                  value={characterForm.name}
                  onChange={(e) => setCharacterForm({ ...characterForm, name: e.target.value })}
                  required
                />
                <Select value={characterForm.type} onValueChange={(value) => setCharacterForm({ ...characterForm, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Character type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="dragon">Crown</SelectItem>
                    <SelectItem value="teddy">Teddy Bear</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Character description"
                  value={characterForm.description}
                  onChange={(e) => setCharacterForm({ ...characterForm, description: e.target.value })}
                />
                <Button type="submit" className="w-full" disabled={createCharacterMutation.isPending}>
                  {createCharacterMutation.isPending ? "Adding..." : "Add Character"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
