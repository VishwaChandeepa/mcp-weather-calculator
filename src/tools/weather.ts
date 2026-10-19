import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import axios from 'axios';
import { config } from '../config.js';

const GEOCODING_URL =
    'https://geocoding-api.open-meteo.com/v1/search';

const FORECAST_URL =
    'https://api.open-meteo.com/v1/forecast';

// ----------------------------------------
// TypeScript Interfaces
// ----------------------------------------

interface GeocodingResult {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
}

interface GeocodingResponse {
    results?: GeocodingResult[];
}

interface CurrentWeatherData {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    visibility?: number | null;
    is_day: number;
}

interface CurrentWeatherResponse {
    current?: CurrentWeatherData;
}

// ----------------------------------------
// Weather Condition Mapping
// ----------------------------------------

function getWeatherCondition(code: number): string {
    if (code === 0) return 'Clear sky';
    if (code === 1) return 'Mainly clear';
    if (code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';

    if (code === 45 || code === 48) return 'Fog';

    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code === 56 || code === 57) return 'Freezing drizzle';

    if (code >= 61 && code <= 65) return 'Rain';
    if (code === 66 || code === 67) return 'Freezing rain';

    if (code >= 71 && code <= 77) return 'Snow';

    if (code >= 80 && code <= 82) return 'Rain showers';
    if (code === 85 || code === 86) return 'Snow showers';

    if (code === 95) return 'Thunderstorm';
    if (code === 96 || code === 99) {
        return 'Thunderstorm with hail';
    }

    return 'Unknown';
}

// ----------------------------------------
// MCP Weather Tool
// ----------------------------------------

export function registerWeatherTool(server: McpServer): void {
    server.registerTool(
        'get_weather',
        {
            description:
                'Get current weather information from Open-Meteo for a city, including temperature, feels-like temperature, condition, humidity, precipitation, wind speed, wind direction, visibility, pressure, and daytime status.',

            inputSchema: {
                city: z
                    .string()
                    .trim()
                    .min(1, 'City name cannot be empty')
                    .describe('Name of the city')
            }
        },

        async ({ city }) => {
            try {
                // Step 1: Find the city coordinates.
                const geocodingResponse =
                    await axios.get<GeocodingResponse>(
                        GEOCODING_URL,
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

                const location =
                    geocodingResponse.data.results?.[0];

                if (!location) {
                    return {
                        content: [
                            {
                                type: 'text' as const,
                                text:
                                    `Could not find a location for "${city}". ` +
                                    'Check the city name and try again.'
                            }
                        ],
                        isError: true
                    };
                }

                // Step 2: Request the current weather.
                const weatherResponse =
                    await axios.get<CurrentWeatherResponse>(
                        FORECAST_URL,
                        {
                            params: {
                                latitude: location.latitude,
                                longitude: location.longitude,
                                current: [
                                    'temperature_2m',
                                    'relative_humidity_2m',
                                    'apparent_temperature',
                                    'precipitation',
                                    'weather_code',
                                    'surface_pressure',
                                    'wind_speed_10m',
                                    'wind_direction_10m',
                                    'visibility',
                                    'is_day'
                                ].join(','),
                                timezone: 'auto',
                                wind_speed_unit: 'kmh',
                                temperature_unit: 'celsius'
                            },
                            timeout: config.weather.requestTimeout
                        }
                    );

                const current =
                    weatherResponse.data.current;

                if (!current) {
                    throw new Error(
                        'Open-Meteo did not return current weather data.'
                    );
                }

                // Step 3: Format the weather information.
                const visibility =
                    typeof current.visibility === 'number'
                        ? `${(current.visibility / 1000).toFixed(1)} km`
                        : 'N/A';

                const place =
                    location.name +
                    (location.country
                        ? `, ${location.country}`
                        : '');

                const condition =
                    getWeatherCondition(current.weather_code);

                const text = [
                    `Weather in ${place} (Open-Meteo):`,
                    `Temperature: ${current.temperature_2m}°C`,
                    `Feels like: ${current.apparent_temperature}°C`,
                    `Condition: ${condition}`,
                    `Humidity: ${current.relative_humidity_2m}%`,
                    `Precipitation: ${current.precipitation} mm`,
                    `Wind Speed: ${current.wind_speed_10m} km/h`,
                    `Wind Direction: ${current.wind_direction_10m}°`,
                    `Visibility: ${visibility}`,
                    `Pressure: ${current.surface_pressure} hPa`,
                    `Daytime: ${current.is_day === 1 ? 'Yes' : 'No'}`
                ].join('\n');

                // Step 4: Return the result to the MCP client.
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text
                        }
                    ]
                };
            } catch (error: unknown) {
                console.error(
                    `Open-Meteo current weather error for "${city}":`,
                    error
                );

                // Step 5: Return a readable error message.
                return {
                    content: [
                        {
                            type: 'text' as const,
                            text:
                                `Could not get current weather for "${city}" ` +
                                'from Open-Meteo. Please try again later.'
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}