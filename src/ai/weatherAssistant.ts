import { GoogleGenAI } from '@google/genai';
import {
    Client,
    StreamableHTTPClientTransport
} from '@modelcontextprotocol/client';

const ai = new GoogleGenAI({});

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
} as const;

export async function askWeatherAssistant(
    question: string
): Promise<string> {
    const mcpClient = new Client({
        name: 'gemini-weather-assistant',
        version: '1.0.0'
    });

    const transport = new StreamableHTTPClientTransport(
        new URL('http://localhost:3000/mcp')
    );

    try {
        await mcpClient.connect(transport);

        const interaction = await ai.interactions.create({
            model: 'gemini-3.8-flash',
            input: question,
            tools: [weatherTool]
        });

        const functionCall = interaction.steps.find(
            (step) => step.type === 'function_call'
        );

        if (!functionCall || functionCall.type !== 'function_call') {
            return (
                interaction.output_text ??
                'I could not generate a response.'
            );
        }

        const mcpResult = await mcpClient.callTool({
            name: functionCall.name,
            arguments: functionCall.arguments
        });

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

        return (
            finalInteraction.output_text ??
            'I could not generate a final response.'
        );
    } finally {
        await mcpClient.close();
    }
}