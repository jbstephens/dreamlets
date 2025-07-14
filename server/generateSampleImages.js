// One-time script to generate and save sample images locally
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function downloadImage(url, filename) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, filename), buffer);
  console.log(`Saved ${filename}`);
}

async function generateSampleImages() {
  const sampleStories = [
    {
      id: '1',
      filename: 'sample-emma-dragon.png',
      prompt: 'Emma, a 5-year-old girl with curly brown hair and bright eyes, sitting in a magical garden with flowers and butterflies. She is looking up at a small, friendly purple dragon with shimmering scales who is gracefully dancing among the rose bushes. The scene is warm and enchanting with soft sunlight filtering through the garden.',
      description: 'Emma: 5-year-old girl with curly brown hair, bright brown eyes, wearing a colorful dress. Purple Dragon: small, friendly dragon with shimmering purple and silver scales, graceful movements, kind expression.'
    },
    {
      id: '2',
      filename: 'sample-max-pirate.png',
      prompt: 'Max, a 7-year-old boy with short blonde hair, standing on a pirate ship deck under a starry night sky. He is wearing a small pirate hat and holding a treasure map. A friendly parrot with bright green and red feathers sits on his shoulder. The ocean sparkles with moonlight and distant islands are visible.',
      description: 'Max: 7-year-old boy with short blonde hair, blue eyes, wearing a striped shirt and small pirate hat. Captain Squawk: colorful parrot with bright green body, red wing tips, yellow beak, friendly expression.'
    },
    {
      id: '3',
      filename: 'sample-luna-clouds.png',
      prompt: 'Luna, a 6-year-old girl with long black hair in braids, floating gently through a dreamy cloud kingdom. She is wearing a flowing nightgown and surrounded by smiling star creatures that glow softly. The clouds are pastel colors - pink, lavender, and mint green - creating a magical bedtime atmosphere.',
      description: 'Luna: 6-year-old girl with long black hair in braids, dark eyes, wearing a flowing white nightgown. Star Creatures: small, glowing beings with friendly faces, golden light emanating from them, various sizes floating around Luna.'
    }
  ];

  for (const story of sampleStories) {
    console.log(`Generating image for story ${story.id}...`);
    
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: story.prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        }),
      });

      const data = await response.json();
      
      if (data.data && data.data[0] && data.data[0].url) {
        await downloadImage(data.data[0].url, story.filename);
      } else {
        console.error(`Failed to generate image for story ${story.id}:`, data);
      }
    } catch (error) {
      console.error(`Error generating image for story ${story.id}:`, error);
    }
  }
}

generateSampleImages().catch(console.error);