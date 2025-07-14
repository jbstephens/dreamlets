import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const file = fs.createWriteStream(path.join(publicDir, filename));
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Saved ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(path.join(publicDir, filename), () => {});
      reject(err);
    });
  });
}

async function generateAndSaveSampleImages() {
  const sampleStories = [
    {
      filename: 'sample-emma-dragon.png',
      prompt: 'Children\'s book illustration: Emma, a 5-year-old girl with curly brown hair, in a magical garden. A small purple dragon with sparkles is dancing among colorful flowers. Bright, cheerful style.'
    },
    {
      filename: 'sample-max-pirate.png', 
      prompt: 'Children\'s book illustration: Max, a 7-year-old boy with blonde hair wearing a pirate hat, on a ship deck at night. A colorful parrot sits on his shoulder. Stars twinkle overhead.'
    },
    {
      filename: 'sample-luna-clouds.png',
      prompt: 'Children\'s book illustration: Luna, a 6-year-old girl with braided black hair in a white nightgown, floating through pastel clouds. Glowing star creatures surround her in this dreamy scene.'
    }
  ];

  for (let i = 0; i < sampleStories.length; i++) {
    const story = sampleStories[i];
    console.log(`Generating image ${i + 1}/3: ${story.filename}...`);
    
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
        console.error(`Failed to generate image ${i + 1}:`, data);
      }
    } catch (error) {
      console.error(`Error generating image ${i + 1}:`, error);
    }
  }
  
  console.log('Sample images setup complete!');
}

generateAndSaveSampleImages().catch(console.error);