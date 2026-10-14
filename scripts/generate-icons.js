import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const svgPath = path.resolve('./public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const targets = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'pwa-maskable-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon.ico', size: 48 },
  ];

  for (const target of targets) {
    const dest = path.resolve('./public', target.name);
    await sharp(svgBuffer)
      .resize(target.size, target.size)
      .png()
      .toFile(dest);
    console.log(`Generated ${target.name} (${target.size}x${target.size})`);
  }
}

generateIcons().catch(console.error);
