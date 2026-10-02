
import { GoogleGenAI } from '@google/genai';
import {
    Client,
    StreamableHTTPClientTransport
} from '@modelcontextprotocol/client';
import { config } from '../config.js';

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

const forecastTool = {
    type: 'function',
    name: 'get_forecast',
    description:
        'Get a detailed multi-day weather forecast including temperature, weather conditions, rain probability, humidity, and wind information.',
    parameters: {
        type: 'object',
        properties: {
            city: {
                type: 'string',
                description: 'Name of the city'
            },
            days: {
                type: 'integer',
                description: 'Number of forecast days, from 1 to 3',
                minimum: 1,
                maximum: 3
            }
        },
        required: ['city', 'days']
    }
} as const;

const weatherTools = [weatherTool, forecastTool];

export async function askWeatherAssistant(
    question: string
): Promise<string> {
    const mcpClient = new Client({
        name: 'gemini-weather-assistant',
        version: '1.0.0'
    });

    const transport = new StreamableHTTPClientTransport(
        new URL(config.mcp.url)
    );

    try {
        await mcpClient.connect(transport);

        const interaction = await ai.interactions.create({
            model: config.gemini.model,
            input: question,
            tools: weatherTools
        });

        const functionCall = interaction.steps.find(
            (step) => step.type === 'function_call'
        );

        if (
            !functionCall ||
            functionCall.type !== 'function_call'
        ) {
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
            model: config.gemini.model,
            previous_interaction_id: interaction.id,
            tools: weatherTools,
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

