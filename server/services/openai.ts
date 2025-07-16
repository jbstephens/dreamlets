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
  
  const prompt = `Create a longer bedtime story for ${kidNamesStr}${characterNamesStr}. 
  
Story idea: ${storyIdea}
Tone: ${tone}${characterDetailsSection}

Please create a 3-part story with the following structure and length guidelines:
1. INTRODUCTION (Short & Delightful) - Set the scene and introduce characters in a charming way
2. MAIN ADVENTURE (Longer & Meaningful) - The heart of the story with a substantial story arc, challenges, discoveries, and character development. This should be about twice as long as the other parts.
3. RESOLUTION (Satisfying Conclusion) - Wrap up the adventure with a cozy, peaceful ending perfect for bedtime

TARGET LENGTH REQUIREMENTS:
- TOTAL STORY LENGTH: Aim for 4000-5000+ characters (approximately twice the length of typical bedtime stories)
- PART 1 (Introduction): 800-1200 characters - delightful setup
- PART 2 (Main Adventure): 2000-2500+ characters - the longest section with rich detail, meaningful character development, and substantial plot progression
- PART 3 (Resolution): 800-1200 characters - satisfying conclusion

IMPORTANT: This is a LONGER story format. Develop scenes thoroughly with rich descriptions, dialogue, character thoughts, and detailed interactions. Take time to build the adventure with multiple scenes, obstacles, discoveries, and emotional moments.

Each part should be suitable for children and appropriate for bedtime. The story should be engaging but ultimately calming for sleep.

PHYSICAL DESCRIPTION AND CHARACTER TRAIT GUIDELINES:
- When provided with specific physical attributes (hair color, eye color, etc.) for children or detailed character descriptions, use these details ACCURATELY when contextually relevant
- You do NOT need to mention every physical trait in every scene - only include them when they naturally fit the story context
- NEVER contradict or deviate from provided descriptions, but feel free to omit details when they're not relevant to the scene
- Consider story context: mention appearance details when they're important to the plot, action, or emotional moment
- For character personalities and traits, weave them naturally into the story when appropriate rather than forcing them into every paragraph
- If no physical attributes are provided for a child, simply use their name without making up physical descriptions

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
  "characterDescriptions": "MANDATORY CHARACTER REFERENCE SHEET (must remain IDENTICAL in all 3 images): [Child's name]: [age]-year-old [gender if clear from name], [specific skin tone] skin tone, [specific hair color] [hair length] hair, [eye color] eyes, [height description like 'shorter than average' or 'tall for age']. [Story character]: [detailed physical description including size, colors, distinctive features]. CHARACTER POSITIONING: List which character appears on left vs right in group scenes. ALL characters must look EXACTLY the same in each image - only expressions and poses may change.",
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
      max_tokens: 3500
    });

    console.log("Story generation completed successfully");
    const result = JSON.parse(response.choices[0].message.content!);
    return result as StoryResponse;
  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error(`Failed to generate story: ${error.message || 'Unknown error'}`);
  }
}

async function downloadAndSaveImage(imageUrl: string, filename: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const filePath = path.join(process.cwd(), 'public', 'story-images', filename);
    await fs.writeFile(filePath, buffer);
    
    console.log(`Image saved to: ${filePath}`);
    return `/story-images/${filename}`;
  } catch (error) {
    console.error(`Failed to download and save image ${filename}:`, error);
    return imageUrl; // Fallback to original URL if download fails
  }
}

export async function generateImages(imagePrompts: string[], characterDescriptions: string): Promise<GeneratedImages> {
  try {
    console.log("Starting image generation for", imagePrompts.length, "prompts...");
    
    const imagePromises = imagePrompts.map(async (prompt, index) => {
      console.log(`Generating image ${index + 1}...`);
      
      // Simplified prompt focusing on consistency and no text
      const enhancedPrompt = `Simple children's book illustration - NO TEXT OR WORDS anywhere in image.

Characters: ${characterDescriptions}

Scene: ${prompt}

Requirements:
- Simple, clean composition with clear focus
- Characters must look identical to previous images
- Soft children's book art style
- Warm, gentle colors
- NO TEXT, WORDS, LETTERS, or LABELS anywhere
- Single scene only, no panels or frames
- Focus on characters and simple background

Style: Simple children's book illustration, soft watercolor, warm colors, peaceful bedtime story feel.`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      });
      
      const openaiUrl = response.data[0].url!;
      console.log(`Image ${index + 1} generated successfully`);
      
      // Download and save the image locally
      const timestamp = Date.now();
      const filename = `story-${timestamp}-${index + 1}.png`;
      const localUrl = await downloadAndSaveImage(openaiUrl, filename);
      
      return localUrl;
    });

    const imageUrls = await Promise.all(imagePromises);
    console.log("All images generated and saved locally");
    
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
