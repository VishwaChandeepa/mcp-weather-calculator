import { askWeatherAssistant } from './weatherAssistant.js';

async function main() {
    console.log('Testing Gemini + MCP Weather Assistant...\n');

    const response = await askWeatherAssistant(
        'Will it rain in Kandy tomorrow? What is the maximum rain probability and what weather conditions are expected?'
    );

    console.log('Gemini Weather Assistant:\n');
    console.log(response);
}

main().catch((error) => {
    console.error('Weather assistant test failed:', error);
});