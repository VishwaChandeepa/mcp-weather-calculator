
import { GoogleGenAI } from '@google/genai'
import {
    Client,
    StreamableHTTPClientTransport
} from '@modelcontextprotocol/client'

import { config } from '../config.js'

const ai = new GoogleGenAI({
    apiKey: config.gemini.apiKey
})

const weatherTool = {
    type: 'function',
    name: 'get_weather',
    description:
        'Get detailed current weather information for a city.',
    parameters: {
        type: 'object',
        properties: {
            city: {
                type: 'string',
                description: 'Name of the city'
            }
        },
        required: ['city']
    }
} as const

const forecastTool = {
    type: 'function',
    name: 'get_forecast',
    description:
        'Get a detailed multi-day weather forecast including temperature, weather conditions, rain probability, humidity, and wind information.',
    parameters: {
        type: 'object',
        properties: {
            city: {
                type: 'string',
                description: 'Name of the city'
            },
            days: {
                type: 'integer',
                description:
                    'Number of forecast days, from 1 to 3',
                minimum: 1,
                maximum: 3
            }
        },
        required: ['city', 'days']
    }
} as const

const intelligenceTool = {
    type: 'function',
    name: 'analyze_weather',
    description:
        'Analyze current and forecast weather conditions and return weather intelligence including rain risk, heat risk, temperature trend, wind risk, humidity level, severe weather detection, and outdoor activity recommendation.',
    parameters: {
        type: 'object',
        properties: {
            city: {
                type: 'string',
                description:
                    'Name of the city to analyze'
            }
        },
        required: ['city']
    }
} as const

const weatherTools = [
    weatherTool,
    forecastTool,
    intelligenceTool
]

const allowedToolNames = new Set([
    'get_weather',
    'get_forecast',
    'analyze_weather'
])

export async function askWeatherAssistant(
    question: string
): Promise<string> {

    const mcpClient = new Client({
        name: 'gemini-weather-assistant',
        version: '1.0.0'
    })

    const transport =
        new StreamableHTTPClientTransport(
            new URL(config.mcp.url)
        )

    try {

        console.log(
            '\n========================================'
        )

        console.log(
            'AI WEATHER ASSISTANT'
        )

        console.log(
            'Question:',
            question
        )

        console.log(
            'Gemini model:',
            config.gemini.model
        )

        console.log(
            'MCP URL:',
            config.mcp.url
        )

        console.log(
            '========================================'
        )

        // ----------------------------------------
        // 1. Connect to MCP
        // ----------------------------------------

        console.log(
            '1. Connecting to MCP...'
        )

        await mcpClient.connect(transport)

        console.log(
            'MCP connected successfully.'
        )

        // ----------------------------------------
        // 2. First Gemini request
        // ----------------------------------------

        let interaction =
            await ai.interactions.create({
                model: config.gemini.model,
                input: question,
                tools: weatherTools
            })

        // ----------------------------------------
        // 3. Tool-calling loop
        // ----------------------------------------

        const maxToolCalls = 5

        for (
            let toolCallNumber = 1;
            toolCallNumber <= maxToolCalls;
            toolCallNumber++
        ) {

            console.log(
                `\nTool processing round ${toolCallNumber}`
            )

            console.log(
                'Interaction steps:',
                interaction.steps
            )

            // ----------------------------------------
            // Check for final text
            // ----------------------------------------

            if (
                typeof interaction.output_text ===
                    'string' &&
                interaction.output_text.trim()
            ) {

                console.log(
                    'Final Gemini answer:',
                    interaction.output_text
                )

                return interaction.output_text
            }

            // ----------------------------------------
            // Find function call
            // ----------------------------------------

            const functionCall =
                interaction.steps.find(
                    (step) =>
                        step.type === 'function_call'
                )

            if (
                !functionCall ||
                functionCall.type !== 'function_call'
            ) {

                console.log(
                    'No more function calls.'
                )

                console.log(
                    'Gemini output:',
                    interaction.output_text
                )

                return (
                    interaction.output_text ??
                    'I could not generate a response.'
                )
            }

            // ----------------------------------------
            // Validate tool
            // ----------------------------------------

            if (
                !allowedToolNames.has(
                    functionCall.name
                )
            ) {

                throw new Error(
                    `Gemini selected an unsupported tool: ${functionCall.name}`
                )
            }

            console.log(
                `Gemini selected tool: ${functionCall.name}`
            )

            console.log(
                'Tool arguments:',
                functionCall.arguments
            )

            // ----------------------------------------
            // Call MCP tool
            // ----------------------------------------

            console.log(
                'Calling MCP tool...'
            )

            const mcpResult =
                await mcpClient.callTool({
                    name: functionCall.name,
                    arguments: functionCall.arguments
                })

            console.log(
                'MCP tool result:',
                mcpResult
            )

            // ----------------------------------------
            // Send tool result back to Gemini
            // ----------------------------------------

            console.log(
                'Sending MCP result to Gemini...'
            )

            interaction =
                await ai.interactions.create({
                    model: config.gemini.model,

                    previous_interaction_id:
                        interaction.id,

                    tools: weatherTools,

                    input: [
                        {
                            type: 'function_result',

                            name:
                                functionCall.name,

                            call_id:
                                functionCall.id,

                            result: [
                                {
                                    type: 'text',

                                    text:
                                        JSON.stringify(
                                            mcpResult
                                        )
                                }
                            ]
                        }
                    ]
                })

            console.log(
                'Gemini returned another interaction:',
                interaction.id
            )
        }

        // ----------------------------------------
        // Too many tool calls
        // ----------------------------------------

        console.error(
            'Maximum tool-call limit reached.'
        )

        return (
            'I could not complete the weather analysis.'
        )

    } catch (error) {

        console.error(
            '\n========================================'
        )

        console.error(
            'WEATHER ASSISTANT ERROR'
        )

        console.error(
            '========================================'
        )

        console.error(error)

        if (error instanceof Error) {

            console.error(
                'Error message:',
                error.message
            )

            console.error(
                'Error stack:',
                error.stack
            )
        }

        return (
            'I could not generate a final response.'
        )

    } finally {

        try {

            await mcpClient.close()

            console.log(
                'MCP connection closed.'
            )

        } catch (closeError) {

            console.error(
                'Could not close MCP connection:',
                closeError
            )
        }
    }
}
