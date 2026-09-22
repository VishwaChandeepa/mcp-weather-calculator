import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';

export function registerCalculatorTools(server: McpServer): void {
    // Add
    server.registerTool(
        'add',
        {
            description: 'Add two numbers together',
            inputSchema: z.object({
                a: z.number().describe('First number'),
                b: z.number().describe('Second number')
            })
        },
        async ({ a, b }) => {
            const result = a + b;

            return {
                content: [
                    {
                        type: 'text',
                        text: `The result is ${result}`
                    }
                ]
            };
        }
    );

    // Multiply
    server.registerTool(
        'multiply',
        {
            description: 'Multiply two numbers together',
            inputSchema: z.object({
                a: z.number().describe('First number'),
                b: z.number().describe('Second number')
            })
        },
        async ({ a, b }) => {
            const result = a * b;

            return {
                content: [
                    {
                        type: 'text',
                        text: `The result is ${result}`
                    }
                ]
            };
        }
    );
}