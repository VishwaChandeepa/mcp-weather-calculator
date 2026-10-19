import {
afterEach,
describe,
expect,
it,
vi
} from 'vitest';

const {
createMock,
callToolMock,
connectMock,
closeMock
} = vi.hoisted(() => ({
createMock: vi.fn(),
callToolMock: vi.fn(),
connectMock: vi.fn(),
closeMock: vi.fn()
}));

vi.mock('@google/genai', () => ({
GoogleGenAI: class {
interactions = {
create: createMock
};
}
}));

vi.mock('@modelcontextprotocol/client', () => ({
Client: class {
connect = connectMock;
callTool = callToolMock;
close = closeMock;
},
StreamableHTTPClientTransport: class {}
}));

describe('Weather Assistant', () => {
afterEach(() => {
vi.resetAllMocks();
});

it('should accept an answer consistent with the weather tool result', async () => {
    createMock
        .mockResolvedValueOnce({
            id: 'interaction-1',
            output_text: '',
            steps: [
                {
                    type: 'function_call',
                    name: 'get_weather',
                    id: 'call-1',
                    arguments: {
                        city: 'Kandy'
                    }
                }
            ]
        })
        .mockResolvedValueOnce({
            id: 'interaction-2',
            output_text:
                'Kandy currently has light drizzle. The temperature is 28°C. The weather tool does not indicate heavy rain.',
            steps: []
        });

    callToolMock.mockResolvedValueOnce({
        content: [
            {
                type: 'text',
                text:
                    'Weather in Kandy: Temperature 28°C, ' +
                    'Feels like: 31°C, Condition: Light drizzle, ' +
                    'Humidity: 66%, Wind Speed: 8 km/h, ' +
                    'Visibility: 2 km, Pressure: 1015 hPa.'
            }
        ],
        isError: false
    });

    const { askWeatherAssistant } =
        await import('./weatherAssistant.js');

    const answer = await askWeatherAssistant(
        'What is the current weather in Kandy?'
    );

    expect(answer).toContain('Kandy');
    expect(answer.toLowerCase()).toContain('light drizzle');
    expect(answer).toContain('28°C');

    expect(connectMock).toHaveBeenCalledOnce();

    expect(callToolMock).toHaveBeenCalledWith(
        expect.objectContaining({
            name: 'get_weather',
            arguments: {
                city: 'Kandy'
            }
        })
    );

    expect(createMock).toHaveBeenCalledTimes(2);
    expect(closeMock).toHaveBeenCalledOnce();
});

it('should reject an unsupported heavy-rain claim', async () => {
    createMock
        .mockResolvedValueOnce({
            id: 'interaction-1',
            output_text: '',
            steps: [
                {
                    type: 'function_call',
                    name: 'get_weather',
                    id: 'call-1',
                    arguments: {
                        city: 'Kandy'
                    }
                }
            ]
        })
        .mockResolvedValueOnce({
            id: 'interaction-2',
            output_text:
                'Kandy currently has heavy rain and thunderstorms.',
            steps: []
        });

    callToolMock.mockResolvedValueOnce({
        content: [
            {
                type: 'text',
                text:
                    'Weather in Kandy: Temperature: 28°C, ' +
                    'Condition: Light drizzle, Humidity: 66%.'
            }
        ],
        isError: false
    });

    const { askWeatherAssistant } =
        await import('./weatherAssistant.js');

    const answer = await askWeatherAssistant(
        'What is the current weather in Kandy?'
    );

    expect(answer).toBe(
        'I could not safely verify the weather conditions ' +
        'in the generated answer. Please try again.'
    );

    expect(connectMock).toHaveBeenCalledOnce();
    expect(callToolMock).toHaveBeenCalledOnce();
    expect(closeMock).toHaveBeenCalledOnce();
});


});
