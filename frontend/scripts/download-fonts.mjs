import fs from 'node:fs';
import path from 'node:path';

const fontsDir = path.resolve('public/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// User-Agent for modern woff2
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const fontConfigs = [
  {
    family: 'Space Grotesk',
    url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&display=swap',
    weights: ['600', '700'],
    prefix: 'space-grotesk'
  },
  {
    family: 'Inter',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
    weights: ['400', '500', '600'],
    prefix: 'inter'
  },
  {
    family: 'Noto Sans Telugu',
    url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@500;600&display=swap',
    weights: ['500', '600'],
    prefix: 'noto-sans-telugu'
  }
];

async function downloadFonts() {
  for (const config of fontConfigs) {
    console.log(`Fetching CSS for ${config.family}...`);
    const res = await fetch(config.url, { headers: { 'User-Agent': USER_AGENT } });
    const css = await res.text();
    
    // Parse @font-face blocks
    const fontFaceBlocks = css.split('@font-face').slice(1);
    for (const block of fontFaceBlocks) {
      const weightMatch = block.match(/font-weight:\s*(\d+);/);
      const urlMatch = block.match(/src:\s*url\((https:\/\/[^)]+)\)\s*format\(['"]?woff2['"]?\);/);
      if (weightMatch && urlMatch) {
        const weight = weightMatch[1];
        const fontUrl = urlMatch[1];
        if (config.weights.includes(weight)) {
          const filename = `${config.prefix}-${weight}.woff2`;
          const filePath = path.join(fontsDir, filename);
          console.log(`Downloading ${filename} from ${fontUrl}...`);
          const fontRes = await fetch(fontUrl);
          const buffer = Buffer.from(await fontRes.arrayBuffer());
          fs.writeFileSync(filePath, buffer);
          console.log(`Saved ${filename}`);
        }
      }
    }
  }
  console.log('Fonts download completed.');
}

downloadFonts().catch(err => {
  console.error('Failed to download fonts:', err);
  process.exit(1);
});

