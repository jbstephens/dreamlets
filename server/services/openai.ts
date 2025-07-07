import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface StoryRequest {
  kidNames: string[];
  characterNames: string[];
  storyIdea: string;
  tone: string;
}

export interface StoryResponse {
  title: string;
  part1: string;
  part2: string;
  part3: string;
  imagePrompt1: string;
  imagePrompt2: string;
  imagePrompt3: string;
}

export interface GeneratedImages {
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
}

export async function generateStory(request: StoryRequest): Promise<StoryResponse> {
  const { kidNames, characterNames, storyIdea, tone } = request;
  
  console.log("Starting story generation for:", { kidNames, characterNames, storyIdea, tone });
  
  const kidNamesStr = kidNames.join(" and ");
  const characterNamesStr = characterNames.length > 0 ? ` featuring ${characterNames.join(", ")}` : "";
  
  const prompt = `Create a bedtime story for ${kidNamesStr}${characterNamesStr}. 
  
Story idea: ${storyIdea}
Tone: ${tone}

Please create a 3-part story with the following structure:
1. Setup - Introduce the characters and the initial situation
2. Climax - The main adventure or challenge
3. Resolution - How everything is resolved with a cozy ending

Each part should be suitable for children and appropriate for bedtime. The story should be engaging but calming.

Also provide image description prompts for each part that would create beautiful, child-friendly illustrations.

Respond in JSON format with this structure:
{
  "title": "Story Title",
  "part1": "First part of the story...",
  "part2": "Second part of the story...",
  "part3": "Third part of the story...",
  "imagePrompt1": "Description for first illustration...",
  "imagePrompt2": "Description for second illustration...",
  "imagePrompt3": "Description for third illustration..."
}`;

  try {
    console.log("Sending request to OpenAI GPT-4o...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a creative children's story writer who specializes in bedtime stories. Create engaging, age-appropriate stories with beautiful, descriptive language."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000
    });

    console.log("Story generation completed successfully");
    const result = JSON.parse(response.choices[0].message.content!);
    return result as StoryResponse;
  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error(`Failed to generate story: ${error.message || 'Unknown error'}`);
  }
}

export async function generateImages(imagePrompts: string[]): Promise<GeneratedImages> {
  try {
    console.log("Starting image generation for", imagePrompts.length, "prompts...");
    
    const imagePromises = imagePrompts.map(async (prompt, index) => {
      console.log(`Generating image ${index + 1}...`);
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Children's book illustration style: ${prompt}. Soft, warm colors, friendly and cozy atmosphere, suitable for bedtime stories.`,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      });
      console.log(`Image ${index + 1} generated successfully`);
      return response.data[0].url!;
    });

    const imageUrls = await Promise.all(imagePromises);
    console.log("All images generated successfully");
    
    return {
      imageUrl1: imageUrls[0],
      imageUrl2: imageUrls[1],
      imageUrl3: imageUrls[2]
    };
  } catch (error) {
    console.error("Error generating images:", error);
    throw new Error(`Failed to generate images: ${error.message || 'Unknown error'}`);
  }
}
