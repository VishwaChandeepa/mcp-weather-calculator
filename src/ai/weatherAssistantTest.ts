import { askWeatherAssistant } from './weatherAssistant.js';

async function main() {
    const response = await askWeatherAssistant(
        'What is the current weather in Kandy?'
    );

    console.log('\nGemini Weather Assistant:\n');
    console.log(response);
}

main().catch((error) => {
    console.error('Weather assistant test failed:', error);
});