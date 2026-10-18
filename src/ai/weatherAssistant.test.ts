import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
    vi
} from 'vitest';

const createMock = vi.fn();

vi.mock('@google/genai', () => ({
    GoogleGenAI: class {
        interactions = {
            create: createMock
        };
    }
}));

describe('Weather Assistant', () => {
    beforeAll(async () => {
        const firstInteraction = {
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
        };

        const finalInteraction = {
            id: 'interaction-2',
            output_text:
                'Kandy currently has heavy rain. It is not recommended to go outside.',
            steps: []
        };

        createMock
            .mockResolvedValueOnce(firstInteraction)
            .mockResolvedValueOnce(finalInteraction);
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    it('should generate a final weather response', async () => {
        const { askWeatherAssistant } =
            await import('./weatherAssistant.js');

        const answer =
            await askWeatherAssistant(
                'What is the weather in Kandy?'
            );

        expect(answer).toContain('Kandy');
        expect(answer).toContain(
            'not recommended'
        );

        expect(createMock).toHaveBeenCalled();
    });
});