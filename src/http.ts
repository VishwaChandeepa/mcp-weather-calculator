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
    // Browser API endpoint
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

            const response = await axios.get(
                `https://wttr.in/${encodeURIComponent(city)}?format=j1`
            );

            const current = response.data.current_condition[0];

            const weather = {
                city,
                temperature: `${current.temp_C}°C`,
                feelsLike: `${current.FeelsLikeC}°C`,
                condition: current.weatherDesc[0].value,
                humidity: `${current.humidity}%`,
                windSpeed: `${current.windspeedKmph} km/h`,
                visibility: `${current.visibility} km`,
                pressure: `${current.pressure} mb`
            };

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            res.end(JSON.stringify(weather));
        } catch (error) {
            res.writeHead(500, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });

            res.end(
                JSON.stringify({
                    error: 'Could not get weather data'
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

httpServer.listen(3000, () => {
    console.error(
        'MCP HTTP server running on http://localhost:3000/mcp'
    );

    console.error(
        'Weather API running on http://localhost:3000/api/weather'
    );
});