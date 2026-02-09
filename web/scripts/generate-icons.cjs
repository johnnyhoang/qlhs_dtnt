const { Jimp } = require('jimp');
const path = require('path');

const SOURCE_IMAGE = path.join(__dirname, '../public/logo_dtnt.jpg');
const PUBLIC_DIR = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    console.log(`Reading source image from ${SOURCE_IMAGE}...`);
    const image = await Jimp.read(SOURCE_IMAGE);

    const sizes = [
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'logo192.png', size: 192 },
      { name: 'logo512.png', size: 512 },
      { name: 'apple-touch-icon.png', size: 180 }
    ];

    for (const icon of sizes) {
      const targetPath = path.join(PUBLIC_DIR, icon.name);
      console.log(`Generating ${icon.name} (${icon.size}x${icon.size})...`);
      
      // Jimp v1.x changes: methods might be async and chain differently.
      // We will perform operations step-by-step.
      const resized = image.clone(); // Clone is often sync on existing bitmap, but let's see. 
      // Actually if clone is async we need await. But let's assume clone is sync for object copy, 
      // but resize is definitely async or returns this?
      // If resize returned a Promise, previous code failed because we didn't await.
      
      // Try unchained:
      if (resized.resize) {
         resized.resize({ w: icon.size, h: icon.size }); 
      }
      
      // If writeAsync is gone, try write (which might return promise or take callback).
      // If write takes callback, we wrap it? Or maybe write returns promise?
      if (resized.write) {
          await resized.write(targetPath);
      } else if (resized.writeAsync) {
          await resized.writeAsync(targetPath);
      } else {
          // Fallback or debug
          console.error('No write method found on resized image');
      }
    }

    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
