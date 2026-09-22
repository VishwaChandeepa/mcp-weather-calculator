import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import axios from 'axios';

function createServer(): McpServer {
    const server = new McpServer({
        name: 'my-weather-calculator',
        version: '1.0.0'
    });

    // Tool 1: Add
    server.registerTool(
        'add',
        {
            description: 'Add two numbers together',
            inputSchema: z.object({
                a: z.number().describe('First number'),
                b: z.number().describe('Second number')
            })
        },
        async ({ a, b }) => {
            const result = a + b;

            return {
                content: [
                    {
                        type: 'text',
                        text: `The result is ${result}`
                    }
                ]
            };
        }
    );

    // Tool 2: Multiply
    server.registerTool(
        'multiply',
        {
            description: 'Multiply two numbers together',
            inputSchema: z.object({
                a: z.number().describe('First number'),
                b: z.number().describe('Second number')
            })
        },
        async ({ a, b }) => {
            const result = a * b;

            return {
                content: [
                    {
                        type: 'text',
                        text: `The result is ${result}`
                    }
                ]
            };
        }
    );

    // Tool 3: Get Weather
    server.registerTool(
        'get_weather',
        {
            description: 'Get the current weather for a city',
            inputSchema: z.object({
                city: z.string().describe('Name of the city')
            })
        },
        async ({ city }) => {
            try {
                const response = await axios.get(
                    `https://wttr.in/${encodeURIComponent(city)}?format=j1`
                );

                const current = response.data.current_condition[0];

                return {
                    content: [
                        {
                            type: 'text',
                            text:
                                `Weather in ${city}:\n` +
                                `Temperature: ${current.temp_C}°C\n` +
                                `Feels like: ${current.FeelsLikeC}°C\n` +
                                `Condition: ${current.weatherDesc[0].value}\n` +
                                `Humidity: ${current.humidity}%`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Could not get weather for ${city}.`
                        }
                    ],
                    isError: true
                };
            }
        }
    );

    // Resource: Server Information
    server.registerResource(
        'server_info',
        'info://calculator',
        {
            description: 'Information about this MCP server',
            mimeType: 'text/plain'
        },
        async () => {
            return {
                contents: [
                    {
                        uri: 'info://calculator',
                        mimeType: 'text/plain',
                        text:
                            `My Weather Calculator MCP Server\n\n` +
                            `Available Tools:\n` +
                            `- add: Add two numbers\n` +
                            `- multiply: Multiply two numbers\n` +
                            `- get_weather: Get current weather for a city`
                    }
                ]
            };
        }
    );

    // Prompt: Weather Report
    server.registerPrompt(
        'weather_report',
        {
            title: 'Weather Report',
            description: 'Create a clear weather report for a city',
            argsSchema: z.object({
                city: z.string().describe('Name of the city')
            })
        },
        ({ city }) => ({
            messages: [
                {
                    role: 'user' as const,
                    content: {
                        type: 'text' as const,
                        text:
                            `Create a clear weather report for ${city}.\n\n` +
                            `Include:\n` +
                            `- City name\n` +
                            `- Temperature\n` +
                            `- Feels like temperature\n` +
                            `- Weather condition\n` +
                            `- Humidity\n\n` +
                            `Keep the report simple and easy to understand.`
                    }
                }
            ]
        })
    );

    return server;
}

void serveStdio(createServer);

console.error('My Weather Calculator MCP server is running');