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
  kidPhysicalAttributes?: Array<{
    name: string;
    hairColor?: string;
    eyeColor?: string;
    hairLength?: string;
    skinTone?: string;
  }>;
}

export interface StoryResponse {
  title: string;
  part1: string;
  part2: string;
  part3: string;
  characterDescriptions: string;
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
  const { kidNames, characterNames, storyIdea, tone, kidPhysicalAttributes } = request;
  
  console.log("Starting story generation for:", { kidNames, characterNames, storyIdea, tone, kidPhysicalAttributes });
  
  const kidNamesStr = kidNames.join(" and ");
  const characterNamesStr = characterNames.length > 0 ? ` featuring ${characterNames.join(", ")}` : "";
  
  // Build physical attributes section
  let physicalAttributesSection = "";
  if (kidPhysicalAttributes && kidPhysicalAttributes.length > 0) {
    physicalAttributesSection = "\n\nPhysical Attributes (ONLY use these if provided):\n";
    kidPhysicalAttributes.forEach(kid => {
      const attributes = [];
      if (kid.hairColor) attributes.push(`${kid.hairColor} hair`);
      if (kid.hairLength) attributes.push(`${kid.hairLength} hair`);
      if (kid.eyeColor) attributes.push(`${kid.eyeColor} eyes`);
      if (kid.skinTone) attributes.push(`${kid.skinTone} skin`);
      
      if (attributes.length > 0) {
        physicalAttributesSection += `- ${kid.name}: ${attributes.join(", ")}\n`;
      }
    });
  }
  
  const prompt = `Create a bedtime story for ${kidNamesStr}${characterNamesStr}. 
  
Story idea: ${storyIdea}
Tone: ${tone}${physicalAttributesSection}

Please create a 3-part story with the following structure:
1. Setup - Introduce the characters and the initial situation
2. Climax - The main adventure or challenge
3. Resolution - How everything is resolved with a cozy ending

Each part should be suitable for children and appropriate for bedtime. The story should be engaging but calming.

CRITICAL PHYSICAL DESCRIPTION RULES:
- ONLY use the physical attributes provided above when describing the children
- DO NOT make up or invent physical descriptions (hair color, eye color, etc.) for any children
- If no physical attributes are provided for a child, simply use their name without physical descriptions
- You may describe clothing, expressions, and actions, but NOT physical features unless explicitly provided

IMPORTANT: For consistent illustrations, first establish detailed character descriptions that will be used across all three images. Include physical appearance (ONLY if provided above), clothing, and distinctive features for each character (both kids and story characters).

Then provide image description prompts for each part that reference these consistent character descriptions.

Respond in JSON format with this structure:
{
  "title": "Story Title",
  "part1": "First part of the story...",
  "part2": "Second part of the story...",
  "part3": "Third part of the story...",
  "characterDescriptions": "Detailed physical descriptions of all characters (kids and story characters) that will appear consistently across all illustrations. For children, ONLY include physical attributes that were explicitly provided above...",
  "imagePrompt1": "Description for first illustration that references the character descriptions...",
  "imagePrompt2": "Description for second illustration that references the character descriptions...",
  "imagePrompt3": "Description for third illustration that references the character descriptions..."
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

export async function generateImages(imagePrompts: string[], characterDescriptions: string): Promise<GeneratedImages> {
  try {
    console.log("Starting image generation for", imagePrompts.length, "prompts...");
    
    const imagePromises = imagePrompts.map(async (prompt, index) => {
      console.log(`Generating image ${index + 1}...`);
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `Children's book illustration style: ${characterDescriptions} ${prompt}. Soft, warm colors, friendly and cozy atmosphere, suitable for bedtime stories.`,
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
