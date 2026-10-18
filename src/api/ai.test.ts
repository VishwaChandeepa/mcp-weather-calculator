
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    it,
    vi
} from 'vitest';

import { Readable } from 'node:stream';
import { handleRequest } from '../httpHandler.js';

const askWeatherAssistantMock = vi.hoisted(() =>
    vi.fn()
);

vi.mock('../ai/weatherAssistant.js', () => ({
    askWeatherAssistant: askWeatherAssistantMock
}));

function createRequest(body: unknown) {
    const request = Readable.from([
        JSON.stringify(body)
    ]) as any;

    request.method = 'POST';
    request.url = '/api/ai';
    request.headers = {
        'content-type': 'application/json'
    };

    return request;
}

function createResponse() {
    let statusCode = 200;
    let responseBody = '';

    const response = {
        get statusCode() {
            return statusCode;
        },

        set statusCode(value: number) {
            statusCode = value;
        },

        setHeader: vi.fn(),

        writeHead: vi.fn(
            (
                status: number,
                headers?: Record<string, string>
            ) => {
                statusCode = status;

                if (headers) {
                    for (const [key, value] of Object.entries(headers)) {
                        response.setHeader(key, value);
                    }
                }
            }
        ),

        end: vi.fn((body?: string) => {
            responseBody = body ?? '';
        }),

        getBody() {
            return responseBody;
        }
    };

    return response;
}

describe('AI Weather API', () => {
    beforeAll(() => {
        askWeatherAssistantMock.mockResolvedValue(
            'Kandy currently has heavy rain.'
        );
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    it('should return an AI answer for a valid question', async () => {
        const request = createRequest({
            question: 'What is the weather in Kandy?'
        });

        const response = createResponse();

        await handleRequest(request, response as any);

        expect(response.statusCode).toBe(200);

        const data = JSON.parse(response.getBody());

        expect(data).toHaveProperty('answer');

        expect(data.answer).toBe(
            'Kandy currently has heavy rain.'
        );

        expect(
            askWeatherAssistantMock
        ).toHaveBeenCalledWith(
            'What is the weather in Kandy?'
        );
    });

    it('should return 400 when question is missing', async () => {
        const request = createRequest({});

        const response = createResponse();

        await handleRequest(request, response as any);

        expect(response.statusCode).toBe(400);

        const data = JSON.parse(response.getBody());

        expect(data.error).toBe(
            'Question is required'
        );
    });

    it('should return 400 when question is empty', async () => {
        const request = createRequest({
            question: '   '
        });

        const response = createResponse();

        await handleRequest(request, response as any);

        expect(response.statusCode).toBe(400);

        const data = JSON.parse(response.getBody());

        expect(data.error).toBe(
            'Question is required'
        );
    });
});

