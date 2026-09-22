import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

import { registerCalculatorTools } from './tools/calculator.js';
import { registerWeatherTool } from './tools/weather.js';
import { registerForecastTool } from './tools/forecast.js';
import { registerServerInfoResource } from './resources/serverInfo.js';
import { registerWeatherReportPrompt } from './prompt/weatherReport.js';

function createServer(): McpServer {
    const server = new McpServer({
        name: 'my-weather-calculator',
        version: '1.0.0'
    });

    // Register calculator tools
    registerCalculatorTools(server);

    // Register weather tool
    registerWeatherTool(server);

    // Register forecast tool
    registerForecastTool(server);

    // Register resource
    registerServerInfoResource(server);

    // Register prompt
    registerWeatherReportPrompt(server);

    return server;
}

void serveStdio(createServer);

console.error('My Weather Calculator MCP server is running');