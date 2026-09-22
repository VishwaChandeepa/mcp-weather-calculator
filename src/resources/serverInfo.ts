import { McpServer } from '@modelcontextprotocol/server';

export function registerServerInfoResource(server: McpServer): void {
    server.registerResource(
        'server_info',
        'info://calculator',
        {
            description: 'Information about this MCP server',
            mimeType: 'text/plain'
        },
        async () => {
            return {
                contents: [
                    {
                        uri: 'info://calculator',
                        mimeType: 'text/plain',
                        text:
                            `My Weather Calculator MCP Server\n\n` +
                            `Available Tools:\n` +
                            `- add: Add two numbers\n` +
                            `- multiply: Multiply two numbers\n` +
                            `- get_weather: Get detailed current weather\n` +
                            `- get_forecast: Get multi-day weather forecast\n\n` +
                            `Weather information includes:\n` +
                            `- Temperature\n` +
                            `- Feels like temperature\n` +
                            `- Weather condition\n` +
                            `- Humidity\n` +
                            `- Wind speed\n` +
                            `- Visibility\n` +
                            `- Atmospheric pressure\n\n` +
                            `Forecast information includes:\n` +
                            `- Forecast date\n` +
                            `- Minimum temperature\n` +
                            `- Maximum temperature\n` +
                            `- Average temperature`
                    }
                ]
            };
        }
    );
}