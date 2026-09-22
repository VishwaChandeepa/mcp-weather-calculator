import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

export function registerWeatherReportPrompt(server: McpServer): void {
    server.registerPrompt(
        'weather_report',
        {
            title: 'Weather Report',
            description: 'Create a clear and detailed weather report for a city',
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
                            `Create a clear and detailed weather report for ${city}.\n\n` +
                            `Include:\n` +
                            `- City name\n` +
                            `- Temperature\n` +
                            `- Feels like temperature\n` +
                            `- Weather condition\n` +
                            `- Humidity\n` +
                            `- Wind speed\n` +
                            `- Visibility\n` +
                            `- Atmospheric pressure\n\n` +
                            `Keep the report simple and easy to understand.`
                    }
                }
            ]
        })
    );
}