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
  runId: string;
  messageId: string;
}

const STORYTELLING_ASSISTANT_INSTRUCTIONS = `You are a magical bedtime story companion for families. Your role is to create personalized, engaging bedtime stories that grow with each family over time.

## Your Personality
- Warm, creative, and understanding of children's needs
- Remember everything about each family's kids, characters, and preferences
- Build continuity across stories - reference past adventures, character growth, and family memories
- Adapt storytelling style based on what works for each child

## Story Creation Guidelines
- Create 3-part stories (Beginning, Middle, End) with approximately 150-200 words per part
- Each part should be engaging and complete enough for one bedtime reading
- Use provided character details naturally when relevant to the story
- Build on previous stories when appropriate - characters can develop and relationships can grow
- Match the requested tone (cozy, adventurous, magical, etc.)

## Character Consistency
- Remember physical descriptions and personalities from previous interactions
- Let characters evolve naturally over multiple stories
- Reference past adventures when it enhances the current story
- Keep character traits consistent unless showing natural growth

## Response Format
You must respond with a JSON object in this exact format:
{
  "title": "Story title incorporating character names",
  "part1": "Beginning chapter text (150-200 words)",
  "part2": "Middle chapter text (150-200 words)", 
  "part3": "Ending chapter text (150-200 words)",
  "characterDescriptions": "Combined descriptions of all characters for image generation",
  "imagePrompt1": "Simple image description for part 1 scene",
  "imagePrompt2": "Simple image description for part 2 scene", 
  "imagePrompt3": "Simple image description for part 3 scene"
}

## Image Prompts
- Keep image descriptions simple and child-friendly
- Focus on main characters and key scene elements
- Describe what's happening, not complex artistic styles
- Ensure consistency with character descriptions across all three images

Remember: You have persistent memory of this family's story history. Use it to create meaningful continuity and growth in your storytelling.`;

export async function getOrCreateAssistant(userId: string): Promise<{ assistantId: string; threadId: string }> {
  try {
    // For now, create a shared assistant for all users - in production you might want user-specific assistants
    const assistants = await openai.beta.assistants.list({
      limit: 100
    });
    
    let assistant = assistants.data.find(a => a.name === "Dreamlets Storytelling Companion");
    
    if (!assistant) {
      console.log("Creating new Dreamlets storytelling assistant...");
      assistant = await openai.beta.assistants.create({
        name: "Dreamlets Storytelling Companion",
        instructions: STORYTELLING_ASSISTANT_INSTRUCTIONS,
        model: "gpt-4o",
        response_format: { type: "json_object" }
      });
      console.log("Created assistant:", assistant.id);
    }
    
    // Create a new thread for this user if they don't have one
    console.log("Creating new conversation thread for user:", userId);
    const thread = await openai.beta.threads.create();
    console.log("Created thread:", thread.id);
    
    return {
      assistantId: assistant.id,
      threadId: thread.id
    };
  } catch (error) {
    console.error("Error creating assistant/thread:", error);
    throw new Error(`Failed to initialize storytelling assistant: ${error.message}`);
  }
}

export async function generateStoryWithAssistant(
  threadId: string,
  assistantId: string,
  request: StoryRequest,
  isFirstInteraction: boolean = false
): Promise<StoryResponse> {
  try {
    console.log("Generating story with assistant for thread:", threadId);
    
    if (!threadId || threadId === 'undefined') {
      throw new Error("Invalid thread ID provided");
    }
    
    // Check if there are any active runs on this thread first
    console.log("About to check active runs for threadId:", threadId);
    const activeRuns = await openai.beta.threads.runs.list(threadId, { limit: 1 });
    if (activeRuns.data.length > 0 && 
        (activeRuns.data[0].status === 'in_progress' || activeRuns.data[0].status === 'queued')) {
      console.log("Waiting for active run to complete...");
      // Wait for the active run to complete
      let activeRun = activeRuns.data[0];
      while (activeRun.status === 'in_progress' || activeRun.status === 'queued') {
        await new Promise(resolve => setTimeout(resolve, 2000));
        activeRun = await openai.beta.threads.runs.retrieve(threadId, activeRun.id);
      }
      console.log("Active run completed with status:", activeRun.status);
    }
    
    // Build the story request message
    let messageContent = "";
    
    if (isFirstInteraction) {
      // First interaction - introduce the family
      messageContent = `Hello! I'm excited to start creating magical bedtime stories for this family. Let me tell you about them:

## Children:
${request.kidPhysicalAttributes?.map(kid => 
  `- ${kid.name} (age ${kid.age}): ${kid.description || 'A wonderful child'}, ${kid.skinTone} skin, ${kid.eyeColor} eyes, ${kid.hairLength} ${kid.hairColor} hair`
).join('\n') || 'No children details provided'}

## Story Characters:
${request.characterDescriptions?.map(char => 
  `- ${char.name}: ${char.description}`
).join('\n') || 'No additional characters'}

Now please create a ${request.tone} bedtime story about: "${request.storyIdea}"

Make it special for ${request.kidNames.join(' and ')}${request.characterNames.length > 0 ? ` featuring ${request.characterNames.join(', ')}` : ''}.`;
    } else {
      // Subsequent interactions - the assistant remembers the family
      messageContent = `Please create another ${request.tone} bedtime story for ${request.kidNames.join(' and ')} about: "${request.storyIdea}"${request.characterNames.length > 0 ? ` featuring ${request.characterNames.join(', ')}` : ''}.

Remember everything you know about this family and build on previous stories when it makes sense!`;
    }
    
    // Add message to thread
    console.log("About to create message for threadId:", threadId);
    const message = await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: messageContent
    });
    
    // Run the assistant
    console.log("About to create run for threadId:", threadId, "assistantId:", assistantId);
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId
    });
    
    // Wait for completion with timeout
    console.log("About to retrieve run status for threadId:", threadId, "runId:", run.id);
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout
    
    while ((runStatus.status === 'in_progress' || runStatus.status === 'queued') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
      attempts++;
    }
    
    if (runStatus.status !== 'completed') {
      throw new Error(`Assistant run failed with status: ${runStatus.status} after ${attempts} seconds`);
    }
    
    // Get the assistant's response
    console.log("About to list messages for threadId:", threadId);
    const messages = await openai.beta.threads.messages.list(threadId);
    const assistantMessage = messages.data.find(m => m.role === 'assistant' && m.run_id === run.id);
    
    if (!assistantMessage || !assistantMessage.content[0] || assistantMessage.content[0].type !== 'text') {
      throw new Error("No response from assistant");
    }
    
    const responseText = assistantMessage.content[0].text.value;
    console.log("Assistant response:", responseText);
    
    // Parse the JSON response
    const storyData = JSON.parse(responseText);
    
    return {
      title: storyData.title,
      part1: storyData.part1,
      part2: storyData.part2,
      part3: storyData.part3,
      characterDescriptions: storyData.characterDescriptions,
      imagePrompt1: storyData.imagePrompt1,
      imagePrompt2: storyData.imagePrompt2,
      imagePrompt3: storyData.imagePrompt3,
      runId: run.id,
      messageId: assistantMessage.id
    };
    
  } catch (error: any) {
    console.error("Error generating story with assistant:", error);
    throw new Error(`Failed to generate story: ${error.message}`);
  }
}

export async function addContextToThread(
  threadId: string,
  context: string
): Promise<void> {
  try {
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: `Context update: ${context}`
    });
    console.log("Added context to thread:", threadId);
  } catch (error) {
    console.error("Error adding context to thread:", error);
  }
}