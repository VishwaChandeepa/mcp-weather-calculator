import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
    Client,
    StreamableHTTPClientTransport
} from '@modelcontextprotocol/client';

describe('MCP Client Integration', () => {
    let client: Client;

    beforeAll(async () => {
        client = new Client({
            name: 'weather-test-client',
            version: '1.0.0'
        });

        const transport =
            new StreamableHTTPClientTransport(
                new URL('http://localhost:3000/mcp')
            );

        await client.connect(transport);
    });

    afterAll(async () => {
        await client.close();
    });

    it('should connect to the MCP server', async () => {
        const result = await client.listTools();

        expect(result.tools.length).toBeGreaterThan(0);
    });

    it('should expose the expected MCP tools', async () => {
        const result = await client.listTools();

        const toolNames = result.tools.map(
            (tool) => tool.name
        );

        expect(toolNames).toContain('add');
        expect(toolNames).toContain('multiply');
        expect(toolNames).toContain('get_weather');
        expect(toolNames).toContain('get_forecast');
        expect(toolNames).toContain('analyze_weather');
    });

    it('should call get_weather successfully', async () => {
        const result = await client.callTool({
            name: 'get_weather',
            arguments: {
                city: 'Kandy'
            }
        });

        expect(result.isError).not.toBe(true);
        expect(result.content).toBeDefined();

        const textContent = result.content.find(
            (item) => item.type === 'text'
        );

        expect(textContent).toBeDefined();

        if (textContent?.type === 'text') {
            expect(textContent.text).toContain(
                'Weather in Kandy'
            );
        }
    });

    it('should call get_forecast successfully', async () => {
        const result = await client.callTool({
            name: 'get_forecast',
            arguments: {
                city: 'Kandy',
                days: 3
            }
        });

        expect(result.isError).not.toBe(true);
        expect(result.content).toBeDefined();

        const textContent = result.content.find(
            (item) => item.type === 'text'
        );

        expect(textContent).toBeDefined();

        if (textContent?.type === 'text') {
            expect(textContent.text).toContain(
                'Detailed Weather Forecast for Kandy'
            );
        }
    });

    it('should call analyze_weather successfully', async () => {
        const result = await client.callTool({
            name: 'analyze_weather',
            arguments: {
                city: 'Kandy'
            }
        });

        expect(result.isError).not.toBe(true);
        expect(result.content).toBeDefined();

        const textContent = result.content.find(
            (item) => item.type === 'text'
        );

        expect(textContent).toBeDefined();

        if (textContent?.type === 'text') {
            expect(textContent.text).toContain(
                '"city": "Kandy"'
            );

            expect(textContent.text).toContain(
                '"intelligence"'
            );
        }
    });
});