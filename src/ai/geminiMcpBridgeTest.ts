import { GoogleGenAI } from '@google/genai';
import {
    Client,
    StreamableHTTPClientTransport
} from '@modelcontextprotocol/client';

const ai = new GoogleGenAI({});

const mcpClient = new Client({
    name: 'gemini-weather-bridge',
    version: '1.0.0'
});

const weatherTool = {
    type: 'function',
    name: 'get_weather',
    description: 'Get detailed current weather information for a city.',
    parameters: {
        type: 'object',
        properties: {
            city: {
                type: 'string',
                description: 'Name of the city'
            }
        },
        required: ['city']
    }
};

async function main() {
    const transport = new StreamableHTTPClientTransport(
        new URL('http://localhost:3000/mcp')
    );

    await mcpClient.connect(transport);

    console.log('Connected to MCP server.');

    const interaction = await ai.interactions.create({
        model: 'gemini-3.8-flash',

        input: 'What is the current weather in Kandy?',

        tools: [weatherTool]
    });

    const functionCall = interaction.steps.find(
        (step) => step.type === 'function_call'
    );

    if (!functionCall || functionCall.type !== 'function_call') {
        console.log('\nGemini did not request a tool.');

        await mcpClient.close();
        return;
    }

    console.log('\nGemini requested tool:');
    console.log(`Tool: ${functionCall.name}`);
    console.log(`Arguments: ${JSON.stringify(functionCall.arguments)}`);

    console.log('\nCalling MCP tool...');

    const mcpResult = await mcpClient.callTool({
        name: functionCall.name,
        arguments: functionCall.arguments
    });

    console.log('\nMCP tool result:');
    console.dir(mcpResult, { depth: null });

    console.log('\nSending MCP result back to Gemini...');

    const finalInteraction = await ai.interactions.create({
        model: 'gemini-3.8-flash',

        previous_interaction_id: interaction.id,

        tools: [weatherTool],

        input: [
            {
                type: 'function_result',
                name: functionCall.name,
                call_id: functionCall.id,
                result: [
                    {
                        type: 'text',
                        text: JSON.stringify(mcpResult)
                    }
                ]
            }
        ]
    });

    console.log('\nFinal Gemini response:\n');
    console.log(finalInteraction.output_text);

    await mcpClient.close();
}

main().catch((error) => {
    console.error('Gemini MCP bridge test failed:', error);
});