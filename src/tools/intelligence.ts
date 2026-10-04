
import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import axios from 'axios';
import { config } from '../config.js';

import {
    analyzeWeather,
    type WeatherForecastDay
} from '../intelligence/weatherIntelligence.js';

type LocationData = {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
};

async function geocodeCity(
    city: string
): Promise<LocationData> {
    const response = await axios.get(
        'https://geocoding-api.open-meteo.com/v1/search',
        {
            params: {
                name: city,
                count: 1,
                language: 'en',
                format: 'json'
            },
            timeout: config.weather.requestTimeout
        }
    );

    const result =
        response.data.results?.[0];

    if (!result) {
        throw new Error('City not found');
    }

    return {
        name: result.name,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude
    };
}

export function registerIntelligenceTool(
    server: McpServer
): void {
    server.registerTool(
        'analyze_weather',
        {
            description:
                'Analyze current and forecast weather conditions and return weather intelligence including rain risk, heat risk, temperature trend, wind risk, humidity level, severe weather detection, and outdoor activity recommendation.',

            inputSchema: z.object({
                city: z
                    .string()
                    .min(1)
                    .describe(
                        'Name of the city to analyze'
                    )
            })
        },

        async ({ city }) => {
            try {
                const location =
                    await geocodeCity(city);

                const response =
                    await axios.get(
                        'https://api.open-meteo.com/v1/forecast',
                        {
                            params: {
                                latitude:
                                    location.latitude,

                                longitude:
                                    location.longitude,

                                current:
                                    'temperature_2m,weather_code',

                                daily:
                                    'temperature_2m_min,temperature_2m_max,temperature_2m_mean,precipitation_probability_max,relative_humidity_2m_mean,wind_speed_10m_max,weather_code',

                                forecast_days: 2,

                                timezone: 'auto'
                            },

                            timeout:
                                config.weather.requestTimeout
                        }
                    );

                const current =
                    response.data.current;

                const daily =
                    response.data.daily;

                const forecast: WeatherForecastDay = {
                    date:
                        daily.time[1],

                    minTemperature:
                        Number(
                            daily
                                .temperature_2m_min[1]
                        ),

                    maxTemperature:
                        Number(
                            daily
                                .temperature_2m_max[1]
                        ),

                    averageTemperature:
                        Number(
                            daily
                                .temperature_2m_mean[1]
                        ),

                    condition:
                        getWeatherCondition(
                            Number(
                                daily
                                    .weather_code[1]
                            )
                        ),

                    rainProbability:
                        Number(
                            daily
                                .precipitation_probability_max[1]
                        ),

                    humidity:
                        Number(
                            daily
                                .relative_humidity_2m_mean[1]
                        ),

                    windSpeed:
                        Number(
                            daily
                                .wind_speed_10m_max[1]
                        )
                };

                const intelligence =
                    analyzeWeather(
                        Number(
                            current.temperature_2m
                        ),
                        forecast
                    );

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(
                                {
                                    city:
                                        location.name,

                                    country:
                                        location.country,

                                    forecastDate:
                                        forecast.date,

                                    intelligence
                                },
                                null,
                                2
                            )
                        }
                    ]
                };
            } catch (error) {
                console.error(
                    'Weather Intelligence MCP tool error:',
                    error
                );

                return {
                    content: [
                        {
                            type: 'text',
                            text:
                                `Could not analyze weather intelligence for ${city}.`
                        }
                    ],

                    isError: true
                };
            }
        }
    );
}

function getWeatherCondition(
    code: number
): string {
    if (code === 0) {
        return 'Clear sky';
    }

    if (
        code === 1 ||
        code === 2
    ) {
        return 'Partly cloudy';
    }

    if (code === 3) {
        return 'Overcast';
    }

    if (
        code === 45 ||
        code === 48
    ) {
        return 'Fog';
    }

    if (
        code >= 51 &&
        code <= 57
    ) {
        return 'Drizzle';
    }

    if (
        code >= 61 &&
        code <= 67
    ) {
        return 'Rain';
    }

    if (
        code >= 71 &&
        code <= 77
    ) {
        return 'Snow';
    }

    if (
        code >= 80 &&
        code <= 82
    ) {
        return 'Rain showers';
    }

    if (
        code >= 95 &&
        code <= 99
    ) {
        return 'Thunderstorm';
    }

    return 'Unknown';
}

