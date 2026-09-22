import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import axios from 'axios';

export function registerForecastTool(server: McpServer): void {
    server.registerTool(
        'get_forecast',
        {
            description: 'Get a multi-day weather forecast for a city',
            inputSchema: z.object({
                city: z.string().describe('Name of the city'),
                days: z
                    .number()
                    .int()
                    .min(1)
                    .max(3)
                    .describe('Number of forecast days (1-3)')
            })
        },
        async ({ city, days }) => {
            try {
                const response = await axios.get(
                    `https://wttr.in/${encodeURIComponent(city)}?format=j1`
                );

                const forecast = response.data.weather
                    .slice(0, days)
                    .map((day: any) => {
                        return (
                            `Date: ${day.date}\n` +
                            `Minimum Temperature: ${day.mintempC}°C\n` +
                            `Maximum Temperature: ${day.maxtempC}°C\n` +
                            `Average Temperature: ${day.avgtempC}°C`
                        );
                    })
                    .join('\n\n');

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Weather Forecast for ${city}\n\n${forecast}`
                        }
                    ]
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Could not get weather forecast for ${city}.`
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}