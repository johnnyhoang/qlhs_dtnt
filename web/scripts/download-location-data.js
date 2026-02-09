import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = 'https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json';
const outputPath = path.join(__dirname, '../src/assets/vietnam-data.json');

console.log(`Downloading data from ${url}...`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            console.log(`Successfully downloaded ${jsonData.length} provinces.`);
            
            // Ensure directory exists
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
            console.log(`Data saved to ${outputPath}`);
        } catch (error) {
            console.error('Error parsing JSON:', error.message);
        }
    });

}).on('error', (err) => {
    console.error('Error downloading data:', err.message);
});
