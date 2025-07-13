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
    age: number;
    description?: string;
    hairColor?: string;
    eyeColor?: string;
    hairLength?: string;
    skinTone?: string;
  }>;
  characterDescriptions?: Array<{
    name: string;
    description?: string;
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
  const { kidNames, characterNames, storyIdea, tone, kidPhysicalAttributes, characterDescriptions } = request;
  
  console.log("Starting story generation for:", { kidNames, characterNames, storyIdea, tone, kidPhysicalAttributes, characterDescriptions });
  
  const kidNamesStr = kidNames.join(" and ");
  const characterNamesStr = characterNames.length > 0 ? ` featuring ${characterNames.join(", ")}` : "";
  
  // Build character details section
  let characterDetailsSection = "";
  
  // Add kid details
  if (kidPhysicalAttributes && kidPhysicalAttributes.length > 0) {
    characterDetailsSection = "\n\nCharacter Details (ONLY use these if provided):\n\nChildren:\n";
    kidPhysicalAttributes.forEach(kid => {
      const attributes = [];
      attributes.push(`${kid.age} years old`);
      if (kid.hairColor) attributes.push(`${kid.hairColor} hair`);
      if (kid.hairLength) attributes.push(`${kid.hairLength} hair`);
      if (kid.eyeColor) attributes.push(`${kid.eyeColor} eyes`);
      if (kid.skinTone) attributes.push(`${kid.skinTone} skin`);
      
      const personalityDescription = kid.description ? ` - ${kid.description}` : "";
      characterDetailsSection += `- ${kid.name}: ${attributes.join(", ")}${personalityDescription}\n`;
    });
  }
  
  // Add story character descriptions
  if (characterDescriptions && characterDescriptions.length > 0) {
    if (!characterDetailsSection) {
      characterDetailsSection = "\n\nCharacter Details (ONLY use these if provided):\n";
    }
    characterDetailsSection += "\nStory Characters:\n";
    characterDescriptions.forEach(char => {
      const description = char.description ? ` - ${char.description}` : "";
      characterDetailsSection += `- ${char.name}${description}\n`;
    });
  }
  
  const prompt = `Create a bedtime story for ${kidNamesStr}${characterNamesStr}. 
  
Story idea: ${storyIdea}
Tone: ${tone}${characterDetailsSection}

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

CRITICAL CHARACTER CONSISTENCY FOR ILLUSTRATIONS:
First, establish EXACT character descriptions that must remain identical across all three images:

For each child character:
- Use ONLY the attributes provided above (age, skin tone, hair color, eye color, hair length)
- Age consistency: Maintain the stated age UNLESS the story specifically involves age progression (birthdays, time travel, growing up themes, etc.)
- If the story involves intentional aging, show appropriate age changes while maintaining other physical features
- If gender is not explicitly provided, infer it carefully from the name and maintain it consistently
- DO NOT invent any physical features not provided above

For story characters (animals, magical creatures, etc.):
- Create specific physical descriptions that will remain consistent
- Include distinctive features (colors, size, clothing, etc.)

Then create three image prompts that reference these exact character descriptions, ensuring the characters look identical in all three scenes.

Respond in JSON format with this structure:
{
  "title": "Story Title",
  "part1": "First part of the story...",
  "part2": "Second part of the story...",
  "part3": "Third part of the story...",
  "characterDescriptions": "EXACT physical descriptions for consistent illustration: [Child's name]: [age]-year-old [gender if clear from name] with [specific skin tone] skin, [specific hair color] [hair length] hair, [eye color] eyes, showing age-appropriate size and maturity. [Story character]: [detailed consistent physical description]. ALL characters must appear IDENTICAL across all three images UNLESS the story specifically involves age progression themes.",
  "imagePrompt1": "First scene description referencing the exact character descriptions above...",
  "imagePrompt2": "Second scene description referencing the exact character descriptions above...",
  "imagePrompt3": "Third scene description referencing the exact character descriptions above..."
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
      
      // Enhanced prompt with stronger consistency requirements
      const enhancedPrompt = `CONSISTENT CHARACTER ILLUSTRATION - Children's book style: 
      
CHARACTER REQUIREMENTS (MUST MAINTAIN EXACTLY): ${characterDescriptions}

SCENE: ${prompt}

CRITICAL CONSISTENCY RULES:
- Keep ALL character physical features identical across scenes (skin tone, hair color, eye color, hair length, facial features)
- Age consistency: Maintain EXACT age throughout UNLESS the story specifically involves age progression (birthdays, time travel, growing up, etc.)
- If story involves intentional aging, show appropriate age changes while keeping other physical features consistent
- Characters must remain the same gender throughout
- Only clothing, expressions, and intentional age changes may vary between scenes
- Maintain consistent art style and proportions

Style: Soft, warm colors, friendly and cozy atmosphere, children's book illustration, suitable for bedtime stories.`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
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
