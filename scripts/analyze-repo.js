import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very basic dotenv parser since we can't guarantee dotenv package is available
const loadEnv = () => {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let val = match[2].trim();
                // remove quotes
                if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                process.env[key] = val;
            }
        });
    } catch(err) {
        console.warn('Could not load .env.local', err.message);
    }
};

loadEnv();

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
    console.error('No GEMINI_API_KEY found in .env.local');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function analyze() {
    console.log('Reading README.md...');
    const readmePath = path.resolve(__dirname, '../README.md');
    let readme = '';
    try {
        readme = fs.readFileSync(readmePath, 'utf8');
    } catch(err) {
        console.error('Could not read README.md', err.message);
        process.exit(1);
    }

    console.log('Analyzing repository content with Gemini...');
    const prompt = `
        You are a tech portfolio expert.
        Analyze the following README.md file of a GitHub repository and suggest a "summary-description" of the project.
        The description should be professional, energetic, and 1 to 2 sentences long.
        Focus on what the project is, why it is useful, and its core features.
        
        README Content:
        ${readme.substring(0, 5000)} // Ensure it fits the prompt limit
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const description = response.text?.trim() || "";
        console.log('\nGenerated Description:\n', description, '\n');

        // Assume repo name is 'gitfolio' for now based on the project folder
        const overridesPath = path.resolve(__dirname, '../data/repoOverrides.json');
        let overrides = {};
        if (fs.existsSync(overridesPath)) {
            overrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
        } else {
            if (!fs.existsSync(path.resolve(__dirname, '../data'))) {
                fs.mkdirSync(path.resolve(__dirname, '../data'));
            }
        }

        // Just using "gitfolio" as the repo name. Change if it differs.
        overrides['gitfolio'] = description;
        
        fs.writeFileSync(overridesPath, JSON.stringify(overrides, null, 2), 'utf8');
        console.log('Saved to data/repoOverrides.json');

    } catch (error) {
        console.error("Gemini Error:", error);
    }
}

analyze();
