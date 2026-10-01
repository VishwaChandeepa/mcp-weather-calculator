import { askWeatherAssistant } from './weatherAssistant.js';

async function main() {
    console.log('Testing Gemini + MCP Weather Assistant...\n');

    const response = await askWeatherAssistant(
        'What is the current weather in Kandy?'
    );

    console.log('Gemini Weather Assistant:\n');
    console.log(response);
}

main().catch((error) => {
    console.error('Weather assistant test failed:', error);
});