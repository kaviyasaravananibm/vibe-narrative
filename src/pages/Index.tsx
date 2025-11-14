import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Emotion = "joy" | "fear" | "sadness" | "anger" | "love";

const emotions: { value: Emotion; label: string; emoji: string }[] = [
  { value: "joy", label: "Joy", emoji: "😊" },
  { value: "fear", label: "Fear", emoji: "😨" },
  { value: "sadness", label: "Sadness", emoji: "😢" },
  { value: "anger", label: "Anger", emoji: "😠" },
  { value: "love", label: "Love", emoji: "❤️" },
];

const Index = () => {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [story, setStory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStory = async (emotion: Emotion) => {
    setIsGenerating(true);
    setSelectedEmotion(emotion);
    setStory("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-story", {
        body: { emotion },
      });

      if (error) throw error;
      setStory(data.story);
    } catch (error) {
      console.error("Error generating story:", error);
      toast.error("Failed to generate story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12 animate-float">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Emotion Story Generator
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose an emotion and watch it come alive through storytelling
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          {emotions.map((emotion) => (
            <Button
              key={emotion.value}
              onClick={() => generateStory(emotion.value)}
              disabled={isGenerating}
              variant="outline"
              className={`h-24 flex flex-col items-center justify-center gap-2 border-2 transition-all hover:scale-105 ${
                selectedEmotion === emotion.value
                  ? `bg-${emotion.value} border-${emotion.value} text-${emotion.value}-foreground`
                  : ""
              }`}
              style={
                selectedEmotion === emotion.value
                  ? {
                      backgroundColor: `hsl(var(--${emotion.value}))`,
                      borderColor: `hsl(var(--${emotion.value}))`,
                      color: `hsl(var(--${emotion.value}-foreground))`,
                    }
                  : {}
              }
            >
              <span className="text-3xl">{emotion.emoji}</span>
              <span className="font-semibold">{emotion.label}</span>
            </Button>
          ))}
        </div>

        {isGenerating && (
          <Card className="p-12 text-center animate-pulse-glow">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Weaving your emotional tale...</p>
          </Card>
        )}

        {story && !isGenerating && (
          <Card
            className="p-8 relative overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{
              borderColor: `hsl(var(--${selectedEmotion}))`,
              borderWidth: "2px",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1 opacity-50"
              style={{
                background: `var(--gradient-${selectedEmotion})`,
              }}
            />
            <div className="flex items-center gap-2 mb-6">
              <Sparkles
                className="h-6 w-6"
                style={{ color: `hsl(var(--${selectedEmotion}))` }}
              />
              <h2 className="text-2xl font-bold">Your Story</h2>
            </div>
            <div className="prose prose-lg max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                {story}
              </p>
            </div>
            <Button
              onClick={() => generateStory(selectedEmotion!)}
              className="mt-6"
              variant="outline"
            >
              Generate New Story
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
