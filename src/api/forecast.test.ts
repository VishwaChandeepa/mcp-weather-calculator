
import { describe, expect, it } from 'vitest';

const BASE_URL = 'http://localhost:3000';

describe('Forecast API', () => {
    it(
        'should return a 3-day forecast for a valid city',
        async () => {
            const response = await fetch(
                `${BASE_URL}/api/forecast?city=Kandy&days=3`
            );

            expect(response.status).toBe(200);

            const data = await response.json();

            expect(data).toHaveProperty('city');
            expect(data).toHaveProperty('country');
            expect(data).toHaveProperty('forecast');

            expect(data.city).toBe('Kandy');
            expect(data.country).toBe('Sri Lanka');

            expect(Array.isArray(data.forecast)).toBe(
                true
            );

            expect(data.forecast).toHaveLength(3);

            for (const day of data.forecast) {
                expect(day).toHaveProperty('date');

                expect(day).toHaveProperty(
                    'minTemperature'
                );

                expect(day).toHaveProperty(
                    'maxTemperature'
                );

                expect(day).toHaveProperty(
                    'averageTemperature'
                );

                expect(day).toHaveProperty(
                    'condition'
                );

                expect(day).toHaveProperty(
                    'rainProbability'
                );

                expect(day).toHaveProperty(
                    'humidity'
                );

                expect(day).toHaveProperty(
                    'windSpeed'
                );
            }
        },
        10000
    );

    it(
        'should return 400 when city is missing',
        async () => {
            const response = await fetch(
                `${BASE_URL}/api/forecast?days=3`
            );

            expect(response.status).toBe(400);

            const data = await response.json();

            expect(data.error).toBe(
                'City is required'
            );
        }
    );

    it(
        'should return 400 when days is below 1',
        async () => {
            const response = await fetch(
                `${BASE_URL}/api/forecast?city=Kandy&days=0`
            );

            expect(response.status).toBe(400);

            const data = await response.json();

            expect(data.error).toBe(
                'Days must be between 1 and 3'
            );
        }
    );

    it(
        'should return 400 when days is above 3',
        async () => {
            const response = await fetch(
                `${BASE_URL}/api/forecast?city=Kandy&days=4`
            );

            expect(response.status).toBe(400);

            const data = await response.json();

            expect(data.error).toBe(
                'Days must be between 1 and 3'
            );
        }
    );
});

