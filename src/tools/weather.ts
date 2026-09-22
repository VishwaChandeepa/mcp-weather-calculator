import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import axios from 'axios';

export function registerWeatherTool(server: McpServer): void {
    server.registerTool(
        'get_weather',
        {
            description: 'Get detailed current weather information for a city',
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
                                `Humidity: ${current.humidity}%\n` +
                                `Wind Speed: ${current.windspeedKmph} km/h\n` +
                                `Visibility: ${current.visibility} km\n` +
                                `Pressure: ${current.pressure} mb`
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
}