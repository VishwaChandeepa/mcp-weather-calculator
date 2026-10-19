import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import axios from 'axios';
import { config } from '../config.js';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

interface GeocodingResult {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
}

interface ForecastResponse {
    daily?: {
        time: string[];
        weather_code: number[];
        temperature_2m_min: number[];
        temperature_2m_max: number[];
        temperature_2m_mean: number[];
        precipitation_probability_max: (number | null)[];
        wind_speed_10m_max: number[];
    };
    hourly?: {
        time: string[];
        relative_humidity_2m: number[];
    };
}

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
    if (code === 96 || code === 99) return 'Thunderstorm with hail';

    return 'Unknown';
}

export function registerForecastTool(server: McpServer): void {
    server.registerTool(
        'get_forecast',
        {
            description:
                'Get a detailed multi-day weather forecast from Open-Meteo, including minimum, maximum and average temperatures, weather conditions, maximum daily rain probability, maximum humidity and maximum wind speed.',
            inputSchema: z.object({
                city: z.string().trim().min(1).describe('Name of the city'),
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
                // Step 1: Find the city's coordinates.
                const geocodingResponse = await axios.get<{
                    results?: GeocodingResult[];
                }>(GEOCODING_URL, {
                    params: {
                        name: city,
                        count: 1,
                        language: 'en',
                        format: 'json'
                    },
                    timeout: config.weather.requestTimeout
                });

                const location = geocodingResponse.data.results?.[0];

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

                // Step 2: Retrieve the forecast from Open-Meteo.
                const weatherResponse = await axios.get<ForecastResponse>(
                    FORECAST_URL,
                    {
                        params: {
                            latitude: location.latitude,
                            longitude: location.longitude,
                            daily: [
                                'weather_code',
                                'temperature_2m_min',
                                'temperature_2m_max',
                                'temperature_2m_mean',
                                'precipitation_probability_max',
                                'wind_speed_10m_max'
                            ].join(','),
                            hourly: 'relative_humidity_2m',
                            forecast_days: days,
                            timezone: 'auto',
                            wind_speed_unit: 'kmh',
                            temperature_unit: 'celsius'
                        },
                        timeout: config.weather.requestTimeout
                    }
                );

                const daily = weatherResponse.data.daily;
                const hourly = weatherResponse.data.hourly;

                if (!daily || !hourly) {
                    throw new Error(
                        'Open-Meteo did not return the requested forecast data.'
                    );
                }

                // Step 3: Format each forecast day.
                const forecast = daily.time
                    .map((date, index) => {
                        const dayStart = `${date}T00:00`;
                        const nextDay = new Date(
                            `${date}T00:00:00Z`
                        );
                        nextDay.setUTCDate(nextDay.getUTCDate() + 1);

                        const nextDate = nextDay
                            .toISOString()
                            .slice(0, 10);

                        const humidityValues = hourly.time
                            .map((time, hourIndex) => ({
                                time,
                                humidity:
                                    hourly.relative_humidity_2m[hourIndex]
                            }))
                            .filter(
                                (item) =>
                                    item.time >= dayStart &&
                                    item.time < `${nextDate}T00:00` &&
                                    typeof item.humidity === 'number'
                            )
                            .map((item) => item.humidity);

                        const maxHumidity = humidityValues.length
                            ? Math.max(...humidityValues)
                            : null;

                        const rainChance =
                            daily.precipitation_probability_max[index];

                        return [
                            `Date: ${date}`,
                            `Minimum Temperature: ${daily.temperature_2m_min[index]}°C`,
                            `Maximum Temperature: ${daily.temperature_2m_max[index]}°C`,
                            `Average Temperature: ${daily.temperature_2m_mean[index]}°C`,
                            `Weather Condition: ${getWeatherCondition(daily.weather_code[index])}`,
                            `Maximum Rain Probability: ${rainChance ?? 'N/A'}%`,
                            `Maximum Humidity: ${maxHumidity ?? 'N/A'}${maxHumidity === null ? '' : '%'}`,
                            `Maximum Wind Speed: ${daily.wind_speed_10m_max[index]} km/h`
                        ].join('\n');
                    })
                    .join('\n\n');

                const place =
                    location.name +
                    (location.country ? `, ${location.country}` : '');

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text: `Detailed Weather Forecast for ${place} (Open-Meteo)\n\n${forecast}`
                        }
                    ]
                };
            } catch (error) {
                console.error(
                    `Open-Meteo forecast error for "${city}":`,
                    error
                );

                return {
                    content: [
                        {
                            type: 'text' as const,
                            text:
                                `Could not get weather forecast for "${city}" ` +
                                'from Open-Meteo. Please try again later.'
                        }
                    ],
                    isError: true
                };
            }
        }
    );
}