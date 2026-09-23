import { createServer as createHttpServer } from 'node:http';
import { URL } from 'node:url';
import { McpServer } from '@modelcontextprotocol/server';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';
import axios from 'axios';

import { registerCalculatorTools } from './tools/calculator.js';
import { registerWeatherTool } from './tools/weather.js';
import { registerForecastTool } from './tools/forecast.js';
import { registerServerInfoResource } from './resources/serverInfo.js';
import { registerWeatherReportPrompt } from './prompt/weatherReport.js';

type LocationData = {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
};

async function geocodeCity(city: string): Promise<LocationData> {
    const response = await axios.get(
        'https://geocoding-api.open-meteo.com/v1/search',
        {
            params: {
                name: city,
                count: 1,
                language: 'en',
                format: 'json'
            }
        }
    );

    const result = response.data.results?.[0];

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

function createMcpServer(): McpServer {
    const server = new McpServer({
        name: 'my-weather-calculator',
        version: '1.0.0'
    });

    registerCalculatorTools(server);
    registerWeatherTool(server);
    registerForecastTool(server);
    registerServerInfoResource(server);
    registerWeatherReportPrompt(server);

    return server;
}

const httpServer = createHttpServer(async (req, res) => {

    // Browser Weather API
    if (req.url?.startsWith('/api/weather')) {
        try {
            const requestUrl = new URL(
                req.url,
                'http://localhost:3000'
            );

            const city = requestUrl.searchParams.get('city');

            if (!city) {
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });

                res.end(
                    JSON.stringify({
                        error: 'City is required'
                    })
                );

                return;
            }

            // Step 1: Find city coordinates
            const location = await geocodeCity(city);

            // Step 2: Get weather using coordinates
            const response = await axios.get(
                'https://api.open-meteo.com/v1/forecast',
                {
                    params: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        current:
                            'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,visibility,surface_pressure,weather_code',
                        timezone: 'auto'
                    }
                }
            );

            const current = response.data.current;

            const weather = {
                city: location.name,
                country: location.country,
                temperature: `${current.temperature_2m}°C`,
                feelsLike: `${current.apparent_temperature}°C`,
                condition: getWeatherCondition(current.weather_code),
                humidity: `${current.relative_humidity_2m}%`,
                windSpeed: `${current.wind_speed_10m} km/h`,
                visibility: `${current.visibility / 1000} km`,
                pressure: `${current.surface_pressure} hPa`
            };

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            res.end(JSON.stringify(weather));

        } catch (error) {
            console.error(error);

            res.writeHead(404, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            res.end(
                JSON.stringify({
                    error: 'City not found. Please enter a valid city name.'
                })
            );
        }

        return;
    }

    // Browser Forecast API
    if (req.url?.startsWith('/api/forecast')) {
        try {
            const requestUrl = new URL(
                req.url,
                'http://localhost:3000'
            );

            const city = requestUrl.searchParams.get('city');

            const days = Number(
                requestUrl.searchParams.get('days') || '3'
            );

            if (!city) {
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });

                res.end(
                    JSON.stringify({
                        error: 'City is required'
                    })
                );

                return;
            }

            if (!Number.isInteger(days) || days < 1 || days > 3) {
                res.writeHead(400, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });

                res.end(
                    JSON.stringify({
                        error: 'Days must be between 1 and 3'
                    })
                );

                return;
            }

            // Step 1: Find city coordinates
            const location = await geocodeCity(city);

            // Step 2: Get forecast using coordinates
            const response = await axios.get(
                'https://api.open-meteo.com/v1/forecast',
                {
                    params: {
                        latitude: location.latitude,
                        longitude: location.longitude,
                        daily:
                            'temperature_2m_min,temperature_2m_max,temperature_2m_mean,weather_code',
                        forecast_days: days,
                        timezone: 'auto'
                    }
                }
            );

            const daily = response.data.daily;

            const forecast = daily.time.map(
                (date: string, index: number) => ({
                    date,
                    minTemperature:
                        `${daily.temperature_2m_min[index]}°C`,
                    maxTemperature:
                        `${daily.temperature_2m_max[index]}°C`,
                    averageTemperature:
                        `${daily.temperature_2m_mean[index]}°C`,
                    condition:
                        getWeatherCondition(
                            daily.weather_code[index]
                        )
                })
            );

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            res.end(
                JSON.stringify({
                    city: location.name,
                    country: location.country,
                    forecast
                })
            );

        } catch (error) {
            console.error(error);

            res.writeHead(404, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            res.end(
                JSON.stringify({
                    error: 'City not found. Please enter a valid city name.'
                })
            );
        }

        return;
    }

    // MCP endpoint
    if (req.url !== '/mcp') {
        res.writeHead(404);
        res.end('Not Found');
        return;
    }

    const server = createMcpServer();

    const transport = new NodeStreamableHTTPServerTransport({
        sessionIdGenerator: undefined
    });

    await server.connect(transport);

    await transport.handleRequest(req, res);
});

function getWeatherCondition(code: number): string {
    if (code === 0) {
        return 'Clear sky';
    }

    if (code === 1 || code === 2) {
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

httpServer.listen(3000, () => {
    console.error(
        'MCP HTTP server running on http://localhost:3000/mcp'
    );

    console.error(
        'Weather API running on http://localhost:3000/api/weather'
    );

    console.error(
        'Forecast API running on http://localhost:3000/api/forecast'
    );
});