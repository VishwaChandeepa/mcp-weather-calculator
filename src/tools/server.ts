import { McpServer } from '@modelcontextprotocol/server';

import { registerCalculatorTools } from '../tools/calculator.js';
import { registerWeatherTool } from '../tools/weather.js';
import { registerForecastTool } from '../tools/forecast.js';
import { registerIntelligenceTool } from '../tools/intelligence.js';
import { registerServerInfoResource } from '../resources/serverInfo.js';
import { registerWeatherReportPrompt } from '../prompt/weatherReport.js';

export function createMcpServer(): McpServer {
    const server = new McpServer({
        name: 'my-weather-calculator',
        version: '1.0.0'
    });

    registerCalculatorTools(server);
    registerWeatherTool(server);
    registerForecastTool(server);
    registerIntelligenceTool(server);
    registerServerInfoResource(server);
    registerWeatherReportPrompt(server);

    return server;
}