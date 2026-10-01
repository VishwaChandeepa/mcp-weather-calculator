import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';

const ai = new GoogleGenAI({});

async function main() {
    const interaction = await ai.interactions.create({
        model: config.gemini.model,
        input: 'Say hello and confirm that the Gemini API is working.'
    });

    console.log('\nGemini response:\n');
    console.log(interaction.output_text);
}

main().catch((error) => {
    console.error('Gemini test failed:', error);
});