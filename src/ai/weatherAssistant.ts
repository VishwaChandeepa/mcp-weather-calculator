import { GoogleGenAI } from '@google/genai';
import {
    Client,
    StreamableHTTPClientTransport
} from '@modelcontextprotocol/client';

import { config } from '../config.js';

// ----------------------------------------
// Gemini configuration
// ----------------------------------------

const ai = new GoogleGenAI({
    apiKey: config.gemini.apiKey
});

// ----------------------------------------
// System instructions
// ----------------------------------------

const systemInstructions = `
You are a reliable weather assistant.

STRICT WEATHER ACCURACY RULES:

1. Use the weather information returned by MCP tools as the source of truth.
2. Never invent or guess temperatures, weather conditions, humidity,
   rain probabilities, wind speeds, visibility, pressure, or dates.
3. Do not claim heavy rain, thunderstorms, or dangerous weather unless
   the tool results explicitly support that claim.
4. Do not recommend avoiding outdoor activities unless the weather
   intelligence results support that recommendation.
5. Clearly distinguish current weather from forecast weather.
6. If a value is missing, say it is unavailable.
7. Preserve the values and units returned by the tools.
8. For forecast questions, use get_forecast.
9. For weather risk assessments and outdoor activity recommendations,
   use analyze_weather.
10. If the available information does not support a conclusion,
    explain that the information is insufficient.
11. Do not describe a rain probability as a guarantee that it will rain.
12. Answer clearly, accurately, and concisely.
`;

// ----------------------------------------
// Gemini function tools
// ----------------------------------------

const weatherTools = [
    {
        type: 'function',
        name: 'get_weather',
        description:
            'Get current weather information for a city, including temperature, feels-like temperature, weather condition, humidity, precipitation, wind, visibility, and pressure.',
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
    },
    {
        type: 'function',
        name: 'get_forecast',
        description:
            'Get a weather forecast for 1 to 3 days, including minimum, maximum and average temperatures, weather conditions, rain probability, humidity, and wind speed.',
        parameters: {
            type: 'object',
            properties: {
                city: {
                    type: 'string',
                    description: 'Name of the city'
                },
                days: {
                    type: 'integer',
                    description: 'Number of forecast days, from 1 to 3',
                    minimum: 1,
                    maximum: 3
                }
            },
            required: ['city', 'days']
        }
    },
    {
        type: 'function',
        name: 'analyze_weather',
        description:
            'Analyze weather conditions and return weather intelligence, including rain risk, heat risk, temperature trend, wind risk, humidity level, severe weather detection, and outdoor activity recommendations.',
        parameters: {
            type: 'object',
            properties: {
                city: {
                    type: 'string',
                    description: 'Name of the city to analyze'
                }
            },
            required: ['city']
        }
    }
] as any[];

const allowedToolNames = new Set([
    'get_weather',
    'get_forecast',
    'analyze_weather'
]);

// ----------------------------------------
// Helpers: Gemini response
// ----------------------------------------

/**
 * Extract the model's final text from an interaction.
 */
function getOutputText(interaction: any): string {
    if (
        typeof interaction.output_text === 'string' &&
        interaction.output_text.trim()
    ) {
        return interaction.output_text.trim();
    }

    const steps: any[] = interaction.steps ?? [];

    for (let i = steps.length - 1; i >= 0; i--) {
        const step = steps[i];

        if (
            step.type === 'function_call' ||
            step.type === 'function_result'
        ) {
            continue;
        }

        if (Array.isArray(step.content)) {
            const text = step.content
                .filter(
                    (part: any) =>
                        part?.type === 'text' &&
                        typeof part.text === 'string'
                )
                .map((part: any) => part.text)
                .join('')
                .trim();

            if (text) {
                return text;
            }
        }
    }

    return '';
}

// ----------------------------------------
// Helpers: MCP results
// ----------------------------------------

/**
 * Convert an MCP tool result into plain text.
 */
function mcpResultToText(mcpResult: any): string {
    const parts: string[] = Array.isArray(mcpResult?.content)
        ? mcpResult.content
              .filter(
                  (content: any) =>
                      content?.type === 'text' &&
                      typeof content.text === 'string'
              )
              .map((content: any) => content.text)
        : [];

    const text = parts.join('\n').trim();

    if (text) {
        return text;
    }

    return JSON.stringify(mcpResult);
}

// ----------------------------------------
// Weather response validation
// ----------------------------------------

/**
 * Weather conditions that should be checked against MCP results.
 *
 * This list is intentionally limited to common conditions.
 * It is not a complete weather vocabulary.
 */
const weatherConditions = [
    'thunderstorms',
    'thunderstorm',
    'heavy rain',
    'moderate rain',
    'light rain',
    'rain showers',
    'showers',
    'heavy drizzle',
    'moderate drizzle',
    'light drizzle',
    'freezing rain',
    'clear sky',
    'mainly clear',
    'partly cloudy',
    'overcast',
    'cloudy',
    'fog',
    'snow'
];

/**
 * Escape text before using it in a regular expression.
 */
function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Determine whether the answer explicitly negates a condition.
 *
 * Examples:
 * - "The data does not indicate heavy rain."
 * - "There is no thunderstorm."
 * - "Heavy rain is not expected."
 *
 * This is a basic language check, not a complete understanding
 * of natural-language meaning.
 */
function isNegatedCondition(
    answer: string,
    condition: string
): boolean {
    const escapedCondition = escapeRegExp(condition);

    const negatedBefore = new RegExp(
        String.raw`\b(?:no|not|never|without|isn't|is not|are not|aren't|doesn't indicate|does not indicate|doesn't show|does not show|not reporting|not experiencing)\s+(?:(?:currently|any|the presence of|a|an)\s+)*${escapedCondition}\b`,
        'i'
    );

    const negatedAfter = new RegExp(
        String.raw`\b${escapedCondition}\b(?:\s+\w+){0,3}\s+\b(?:is not expected|isn't expected|is not occurring|isn't occurring|is not reported|isn't reported|is not indicated|isn't indicated)\b`,
        'i'
    );

    return (
        negatedBefore.test(answer) ||
        negatedAfter.test(answer)
    );
}

/**
 * Validate weather-condition claims in Gemini's answer against
 * the successful MCP tool results collected during this request.
 *
 * Returns false when the answer contains an unnegated condition
 * that does not appear in the recorded source data.
 *
 * This does not yet validate numeric claims or every possible
 * paraphrase of a weather condition.
 */
function validateWeatherAnswer(
    answer: string,
    toolResults: string[]
): boolean {
    const normalizedAnswer = answer.toLowerCase();

    const normalizedSource = toolResults
        .join('\n')
        .toLowerCase();

    for (const condition of weatherConditions) {
        const conditionPattern = new RegExp(
            `\\b${escapeRegExp(condition)}\\b`,
            'i'
        );

        // The answer does not mention this condition.
        if (!conditionPattern.test(normalizedAnswer)) {
            continue;
        }

        // The condition is explicitly supported by the MCP results.
        if (conditionPattern.test(normalizedSource)) {
            continue;
        }

        // A clearly negated mention is not an assertion that
        // the condition is occurring.
        if (isNegatedCondition(normalizedAnswer, condition)) {
            continue;
        }

        console.warn(
            `Weather validation failed: unsupported condition "${condition}".`
        );

        return false;
    }

    return true;
}

// ----------------------------------------
// Weather assistant
// ----------------------------------------

export async function askWeatherAssistant(
    question: string
): Promise<string> {
    const mcpClient = new Client({
        name: 'gemini-weather-assistant',
        version: '1.0.0'
    });

    const transport = new StreamableHTTPClientTransport(
        new URL(config.mcp.url)
    );

    try {
        console.log('\n========================================');
        console.log('AI WEATHER ASSISTANT');
        console.log('Question:', question);
        console.log('Gemini model:', config.gemini.model);
        console.log('MCP URL:', config.mcp.url);
        console.log('========================================');

        // 1. Connect to MCP.
        console.log('1. Connecting to MCP...');

        await mcpClient.connect(transport);

        console.log('MCP connected successfully.');

        // 2. Send the initial question to Gemini.
        let interaction: any = await (ai as any).interactions.create({
            model: config.gemini.model,
            system_instruction: systemInstructions,
            input: question,
            tools: weatherTools
        });

        // Keep successful MCP results available for validation.
        // These results belong to this question only.
        const verifiedToolResults: string[] = [];

        // Limit the number of tool-processing rounds.
        const maxToolRounds = 5;

        // 3. Process tool calls.
        for (
            let round = 1;
            round <= maxToolRounds;
            round++
        ) {
            console.log(`\nTool processing round ${round}`);

            const functionCalls: any[] = (
                interaction.steps ?? []
            ).filter(
                (step: any) =>
                    step.type === 'function_call'
            );

            // 4. No tool calls means Gemini has produced its final answer.
            if (functionCalls.length === 0) {
                const answer = getOutputText(interaction);

                console.log('Final Gemini answer:', answer);

                if (!answer) {
                    return 'I could not generate a response.';
                }

                // Do not return an answer containing an unsupported
                // weather-condition claim.
                if (
                    verifiedToolResults.length > 0 &&
                    !validateWeatherAnswer(
                        answer,
                        verifiedToolResults
                    )
                ) {
                    console.warn(
                        'The generated answer contains an unsupported weather condition.'
                    );

                    return (
                        'I could not safely verify the weather conditions ' +
                        'in the generated answer. Please try again.'
                    );
                }

                return answer;
            }

            // 5. Execute every tool requested in this round.
            const functionResults: any[] = [];

            for (const functionCall of functionCalls) {
                console.log(
                    `Gemini selected tool: ${functionCall.name}`
                );

                console.log(
                    'Tool arguments:',
                    functionCall.arguments
                );

                let resultText: string;

                if (!allowedToolNames.has(functionCall.name)) {
                    resultText =
                        `Error: unsupported tool "${functionCall.name}".`;
                } else {
                    try {
                        const mcpResult: any =
                            await mcpClient.callTool({
                                name: functionCall.name,
                                arguments: (
                                    functionCall.arguments ?? {}
                                ) as Record<string, unknown>
                            });

                        console.log(
                            'MCP tool result:',
                            mcpResult
                        );

                        resultText = mcpResultToText(mcpResult);

                        if (mcpResult?.isError) {
                            resultText = `Tool error: ${resultText}`;
                        } else {
                            // Save successful results for validation.
                            verifiedToolResults.push(resultText);
                        }
                    } catch (toolError) {
                        console.error(
                            'MCP tool call failed:',
                            toolError
                        );

                        resultText = `Tool error: ${
                            toolError instanceof Error
                                ? toolError.message
                                : String(toolError)
                        }`;
                    }
                }

                functionResults.push({
                    type: 'function_result',
                    name: functionCall.name,
                    call_id: functionCall.id,
                    result: [
                        {
                            type: 'text',
                            text: resultText
                        }
                    ]
                });
            }

            console.log('Sending MCP results to Gemini...');

            // 6. Send the tool results back to Gemini.
            interaction = await (ai as any).interactions.create({
                model: config.gemini.model,
                previous_interaction_id: interaction.id,
                system_instruction: systemInstructions,
                tools: weatherTools,
                input: functionResults
            });

            console.log(
                'Gemini returned another interaction:',
                interaction.id
            );
        }

        console.error('Maximum tool-call limit reached.');

        return 'I could not complete the weather analysis.';
    } catch (error) {
        console.error('\n========================================');
        console.error('WEATHER ASSISTANT ERROR');
        console.error('========================================');
        console.error(error);

        return 'I could not generate a final response.';
    } finally {
        // Always attempt to close the MCP connection.
        try {
            await mcpClient.close();

            console.log('MCP connection closed.');
        } catch (closeError) {
            console.error(
                'Could not close MCP connection:',
                closeError
            );
        }
    }
}