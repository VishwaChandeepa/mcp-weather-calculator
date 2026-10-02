import {
    Client,
    StreamableHTTPClientTransport
} from '@modelcontextprotocol/client';

const client = new Client({
    name: 'weather-ai-client',
    version: '1.0.0'
});

async function main() {
    const transport = new StreamableHTTPClientTransport(
        new URL('http://localhost:3000/mcp')
    );

    await client.connect(transport);

    console.log('Connected to MCP server.');

    const tools = await client.listTools();

    console.log('\nAvailable MCP tools:');

    for (const tool of tools.tools) {
        console.log(`- ${tool.name}`);
    }

    console.log('\nCalling get_weather...');

    const weatherResult = await client.callTool({
        name: 'get_weather',
        arguments: {
            city: 'Kandy'
        }
    });

    console.log('\nWeather result:');
    console.dir(weatherResult, { depth: null });

    console.log('\nCalling get_forecast...');

    const forecastResult = await client.callTool({
        name: 'get_forecast',
        arguments: {
            city: 'Kandy',
            days: 3
        }
    });

    console.log('\nForecast result:');
    console.dir(forecastResult, { depth: null });

    await client.close();
}

main().catch((error) => {
    console.error('MCP client test failed:', error);
});