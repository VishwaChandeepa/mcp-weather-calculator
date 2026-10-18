import { describe, expect, it } from 'vitest';

const BASE_URL = 'http://localhost:3000';

describe('Weather API', () => {
    it('should return weather data for a valid city', async () => {
        const response = await fetch(
            `${BASE_URL}/api/weather?city=Kandy`
        );

        expect(response.status).toBe(200);

        const data = await response.json();

        expect(data).toHaveProperty('city');
        expect(data).toHaveProperty('country');
        expect(data).toHaveProperty('temperature');
        expect(data).toHaveProperty('feelsLike');
        expect(data).toHaveProperty('condition');
        expect(data).toHaveProperty('humidity');
        expect(data).toHaveProperty('windSpeed');
        expect(data).toHaveProperty('visibility');
        expect(data).toHaveProperty('pressure');

        expect(data.city).toBe('Kandy');
        expect(data.country).toBe('Sri Lanka');
    });

    it('should return 400 when city is missing', async () => {
        const response = await fetch(
            `${BASE_URL}/api/weather`
        );

        expect(response.status).toBe(400);

        const data = await response.json();

        expect(data.error).toBe(
            'City is required'
        );
    });

    it('should return an error for an invalid city', async () => {
        const response = await fetch(
            `${BASE_URL}/api/weather?city=InvalidCityThatDoesNotExist123456`
        );

        expect(response.status).toBe(404);

        const data = await response.json();

        expect(data.error).toBe(
            'City not found. Please enter a valid city name.'
        );
    });
});