const Jimp = require('jimp');
const path = require('path');

const SOURCE_IMAGE = path.join(__dirname, '../public/logo_dtnt.jpg');
const PUBLIC_DIR = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    console.log(`Reading source image from ${SOURCE_IMAGE}...`);
    const image = await Jimp.read(SOURCE_IMAGE);

    // Favicon (32x32) - .png format (modern browsers support png favicons)
    // .ico generation usually requires specific libraries, but we can stick to png for favicon in modern web
    // or we can just save as .ico if jimp supports it (it partially does or via plugin). 
    // For simplicity and compatibility, we'll generate standard PNGs and a 32x32 PNG for favicon.
    // If strict .ico is needed, we might need another tool, but standard practice now allows type="image/png".

    const sizes = [
      { name: 'favicon.ico', size: 32 }, // Jimp might just save this as png content with ico extension or fail. 
                                         // Safest is to save as favicon-32x32.png and link it.
                                         // But let's try to just resize and save, standard jimp writes based on extension.
                                         // Actually, let's just make sure we have the sizes.
      { name: 'logo192.png', size: 192 },
      { name: 'logo512.png', size: 512 },
      { name: 'apple-touch-icon.png', size: 180 }
    ];

    for (const icon of sizes) {
      const targetPath = path.join(PUBLIC_DIR, icon.name);
      console.log(`Generating ${icon.name} (${icon.size}x${icon.size})...`);
      
      const resized = image.clone().resize(icon.size, icon.size);
      
      // For favicon.ico, we might want to just output a png and rename, or use a specific format.
      // Jimp doesn't natively support full multi-size .ico. 
      // We will generate favicon.png (32x32) and verify index.html links to it.
      if (icon.name === 'favicon.ico') {
          // We'll actually generate a PNG but name it .ico for compatibility if the file type handling allows, 
          // OR better: generate 'favicon.png' and update index.html to point to it.
          // Let's generate 'favicon.png' 32x32.
          await resized.writeAsync(path.join(PUBLIC_DIR, 'favicon-32x32.png'));
          // Also try to write .ico, simply as a single layer
          await resized.writeAsync(targetPath); 
      } else {
          await resized.writeAsync(targetPath);
      }
    }

    console.log('Icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
