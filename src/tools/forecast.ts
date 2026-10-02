import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import axios from 'axios';

export function registerForecastTool(server: McpServer): void {
    server.registerTool(
        'get_forecast',
        {
            description:
                'Get a detailed multi-day weather forecast including temperature, weather conditions, rain probability, humidity, and wind information.',
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
                        const hourly = day.hourly ?? [];

                        const rainChance = hourly.length
                            ? Math.max(
                                  ...hourly.map(
                                      (hour: any) =>
                                          Number(hour.chanceofrain) || 0
                                  )
                              )
                            : 0;

                        const maxHumidity = hourly.length
                            ? Math.max(
                                  ...hourly.map(
                                      (hour: any) =>
                                          Number(hour.humidity) || 0
                                  )
                              )
                            : 0;

                        const maxWindSpeed = hourly.length
                            ? Math.max(
                                  ...hourly.map(
                                      (hour: any) =>
                                          Number(hour.windspeedKmph) || 0
                                  )
                              )
                            : 0;

                        const condition =
                            hourly[0]?.weatherDesc?.[0]?.value ??
                            'Unknown';

                        return (
                            `Date: ${day.date}\n` +
                            `Minimum Temperature: ${day.mintempC}°C\n` +
                            `Maximum Temperature: ${day.maxtempC}°C\n` +
                            `Average Temperature: ${day.avgtempC}°C\n` +
                            `Weather Condition: ${condition}\n` +
                            `Maximum Rain Probability: ${rainChance}%\n` +
                            `Maximum Humidity: ${maxHumidity}%\n` +
                            `Maximum Wind Speed: ${maxWindSpeed} km/h`
                        );
                    })
                    .join('\n\n');

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Detailed Weather Forecast for ${city}\n\n${forecast}`
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