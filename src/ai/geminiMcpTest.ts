import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

async function main() {
    const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash',

        input: 'What is the current weather in Kandy?',

        tools: [
            {
                type: 'mcp_server',
                name: 'weather',
                url: 'http://localhost:3000/mcp'
            }
        ]
    });

    console.log('\nGemini response:\n');
    console.log(interaction.output_text);
}

main().catch((error) => {
    console.error('Gemini MCP test failed:', error);
});