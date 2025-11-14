import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const emotionPrompts = {
  joy: "Write a vivid, uplifting story filled with warmth, laughter, and celebration. Include characters experiencing triumph, connection, and pure happiness. Make every sentence radiate positivity and hope.",
  fear: "Write a tense, atmospheric story that builds suspense and unease. Create shadowy settings, mysterious sounds, and characters facing their deepest anxieties. Every detail should heighten the sense of dread.",
  sadness: "Write a poignant, melancholic story about loss, longing, or heartbreak. Craft characters dealing with grief, missed opportunities, or bittersweet memories. Make the reader feel the weight of sorrow.",
  anger: "Write an intense, passionate story about injustice, betrayal, or conflict. Show characters burning with righteous fury or struggling with rage. Every scene should crackle with tension and fire.",
  love: "Write a tender, romantic story filled with affection, devotion, and deep connection. Create moments of intimacy, sacrifice, and unwavering commitment. Let every word overflow with warmth and care.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emotion } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = emotionPrompts[emotion as keyof typeof emotionPrompts];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You are a master storyteller who creates immersive, emotionally powerful short stories. Each story should be 3-4 paragraphs, with vivid characters, a clear setting, and emotional plot twists that match the requested emotion perfectly.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate story");
    }

    const data = await response.json();
    const story = data.choices[0].message.content;

    return new Response(JSON.stringify({ story }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-story function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
