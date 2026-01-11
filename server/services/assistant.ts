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

export interface AssistantStoryResponse {
  title: string;
  part1: string;
  part2: string;
  part3: string;
  characterDescriptions: Array<{
    name: string;
    description: string;
  }>;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
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
  "characterDescriptions": [
    {
      "name": "Character Name",
      "description": "Physical description for consistent illustrations"
    }
  ]
}

Remember: You have persistent memory of this family's story history. Use it to create meaningful continuity and growth in your storytelling.

After creating the story, always call the generate_story_images function to create illustrations that match your story perfectly.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "generate_story_images",
              description: "Generate illustrations for a children's bedtime story",
              parameters: {
                type: "object",
                properties: {
                  story_title: {
                    type: "string",
                    description: "The title of the story"
                  },
                  character_descriptions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        description: { type: "string" }
                      }
                    },
                    description: "Physical descriptions of characters for consistent illustrations"
                  },
                  image_prompts: {
                    type: "array",
                    items: { type: "string" },
                    description: "Three detailed image prompts for each part of the story"
                  }
                },
                required: ["story_title", "character_descriptions", "image_prompts"]
              }
            }
          }
        ]
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
  userId: string,
  isFirstInteraction: boolean = false
): Promise<AssistantStoryResponse> {
  try {
    console.log("=== ASSISTANT API DEBUG ===");
    console.log("Generating story with assistant for thread:", threadId);
    console.log("Assistant ID:", assistantId);
    console.log("Thread ID type:", typeof threadId);
    console.log("Thread ID value:", threadId);
    console.log("Thread ID === 'undefined':", threadId === 'undefined');
    console.log("Thread ID == undefined:", threadId == undefined);
    console.log("!threadId:", !threadId);
    
    if (!threadId || threadId === 'undefined' || threadId === 'null') {
      throw new Error(`Invalid thread ID provided: ${threadId}`);
    }
    
    if (!assistantId || assistantId === 'undefined' || assistantId === 'null') {
      throw new Error(`Invalid assistant ID provided: ${assistantId}`);
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
    const finalThreadId = threadId; // Store in const to prevent any variable issues
    const finalRunId = run.id;
    
    let runStatus = await openai.beta.threads.runs.retrieve(finalThreadId, finalRunId);
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout
    
    while ((runStatus.status === 'in_progress' || runStatus.status === 'queued' || runStatus.status === 'requires_action') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Retrieving run status for threadId:", finalThreadId, "runId:", finalRunId, "attempt:", attempts, "status:", runStatus.status);
      
      // Handle function calls for image generation
      if (runStatus.status === 'requires_action' && runStatus.required_action?.type === 'submit_tool_outputs') {
        console.log("Assistant requesting function call for image generation");
        
        const toolCalls = runStatus.required_action.submit_tool_outputs.tool_calls;
        const toolOutputs = [];
        
        for (const toolCall of toolCalls) {
          if (toolCall.function.name === 'generate_story_images') {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              console.log("Generating images with args:", args);
              
              // Generate images using DALL-E
              const { generateImages } = await import("./openai");
              const imageUrls = await generateImages(args.image_prompts, args.character_descriptions, userId);
              
              toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({
                  success: true,
                  image_urls: imageUrls,
                  message: "Images generated successfully"
                })
              });
              
              console.log("Images generated successfully:", imageUrls);
            } catch (error) {
              console.error("Error generating images:", error);
              toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify({
                  success: false,
                  error: error.message
                })
              });
            }
          }
        }
        
        // Submit the function outputs
        await openai.beta.threads.runs.submitToolOutputs(finalThreadId, finalRunId, {
          tool_outputs: toolOutputs
        });
      }
      
      runStatus = await openai.beta.threads.runs.retrieve(finalThreadId, finalRunId);
      attempts++;
    }
    
    if (runStatus.status !== 'completed') {
      throw new Error(`Assistant run failed with status: ${runStatus.status} after ${attempts} seconds`);
    }
    
    // Get the assistant's response
    console.log("About to list messages for threadId:", finalThreadId);
    const messages = await openai.beta.threads.messages.list(finalThreadId);
    const assistantMessage = messages.data.find(m => m.role === 'assistant' && m.run_id === finalRunId);
    
    if (!assistantMessage || !assistantMessage.content[0] || assistantMessage.content[0].type !== 'text') {
      throw new Error("No response from assistant");
    }
    
    const responseText = assistantMessage.content[0].text.value;
    console.log("Assistant response:", responseText);
    
    // Parse the JSON response
    const storyData = JSON.parse(responseText);
    
    // Extract image URLs from function call results if available
    let imageUrls = [undefined, undefined, undefined];
    if (runStatus.status === 'completed') {
      // Check if there were any function calls that generated images
      const runSteps = await openai.beta.threads.runs.steps.list(finalThreadId, finalRunId);
      for (const step of runSteps.data) {
        if (step.type === 'tool_calls') {
          for (const toolCall of step.step_details.tool_calls) {
            if (toolCall.type === 'function' && toolCall.function.name === 'generate_story_images') {
              try {
                const output = JSON.parse(toolCall.function.output || '{}');
                if (output.success && output.image_urls) {
                  imageUrls = output.image_urls;
                  console.log("Extracted image URLs from function call:", imageUrls);
                }
              } catch (e) {
                console.log("Could not parse function output for image URLs");
              }
            }
          }
        }
      }
    }
    
    return {
      title: storyData.title,
      part1: storyData.part1,
      part2: storyData.part2,
      part3: storyData.part3,
      characterDescriptions: storyData.characterDescriptions,
      imageUrl1: imageUrls[0],
      imageUrl2: imageUrls[1], 
      imageUrl3: imageUrls[2],
      runId: finalRunId,
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