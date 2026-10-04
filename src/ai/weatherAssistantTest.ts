import { askWeatherAssistant } from './weatherAssistant.js';

async function main() {
    console.log(
        'Testing Gemini + MCP Weather Intelligence...\n'
    );

    const response = await askWeatherAssistant(
        'Analyze the weather in Kandy tomorrow. Give me the rain risk, heat risk, temperature trend, wind risk, humidity level, severe weather status, and outdoor activity recommendation.'
    );

    console.log(
        'Gemini Weather Intelligence:\n'
    );

    console.log(response);
}

main().catch((error) => {
    console.error(
        'Weather intelligence assistant test failed:',
        error
    );
});