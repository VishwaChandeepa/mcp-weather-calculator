import { describe, expect, it } from 'vitest';

import {
    calculateRainRisk,
    calculateHeatRisk,
    calculateTemperatureTrend,
    calculateWindRisk,
    calculateHumidityLevel,
    detectSevereWeather,
    calculateOutdoorActivity,
    analyzeWeather,
    type WeatherForecastDay
} from './weatherIntelligence.js';

describe('Weather Intelligence', () => {

    describe('Rain Risk', () => {

        it('should detect very high rain risk', () => {
            expect(
                calculateRainRisk(90)
            ).toBe('Very High');
        });

        it('should detect moderate rain risk', () => {
            expect(
                calculateRainRisk(45)
            ).toBe('Moderate');
        });

    });

    describe('Heat Risk', () => {

        it('should detect low heat risk', () => {
            expect(
                calculateHeatRisk(28)
            ).toBe('Low');
        });

        it('should detect moderate heat risk', () => {
            expect(
                calculateHeatRisk(32)
            ).toBe('Moderate');
        });

        it('should detect high heat risk', () => {
            expect(
                calculateHeatRisk(37)
            ).toBe('High');
        });

        it('should detect extreme heat risk', () => {
            expect(
                calculateHeatRisk(42)
            ).toBe('Extreme');
        });

    });

    describe('Temperature Trend', () => {

        it('should detect warming temperature', () => {
            expect(
                calculateTemperatureTrend(23, 27)
            ).toBe('Warming');
        });

        it('should detect cooling temperature', () => {
            expect(
                calculateTemperatureTrend(23, 20)
            ).toBe('Cooling');
        });

    });

    describe('Wind Risk', () => {

        it('should detect high wind risk', () => {
            expect(
                calculateWindRisk(45)
            ).toBe('High');
        });

    });

    describe('Humidity', () => {

        it('should detect high humidity', () => {
            expect(
                calculateHumidityLevel(90)
            ).toBe('High');
        });

    });

    describe('Severe Weather', () => {

        it('should detect thunderstorms', () => {
            expect(
                detectSevereWeather('Thunderstorm')
            ).toBe(true);
        });

    });

    describe('Outdoor Activity', () => {

        it('should not recommend outdoor activity during very high rain risk', () => {
            expect(
                calculateOutdoorActivity(
                    'Very High',
                    'Low',
                    false
                )
            ).toBe('Not Recommended');
        });

        it('should recommend outdoor activity during moderate conditions', () => {
            expect(
                calculateOutdoorActivity(
                    'Moderate',
                    'Low',
                    false
                )
            ).toBe('Recommended');
        });

    });

    describe('Complete Weather Intelligence Analysis', () => {

        it('should correctly analyze a complete weather forecast', () => {

            const forecast: WeatherForecastDay = {
                date: '2026-10-03',
                minTemperature: 21,
                maxTemperature: 37,
                averageTemperature: 24,
                condition: 'Rain',
                rainProbability: 90,
                humidity: 85,
                windSpeed: 10
            };

            const intelligence =
                analyzeWeather(
                    23,
                    forecast
                );

            expect(intelligence).toEqual({
                rainRisk: 'Very High',
                heatRisk: 'High',
                temperatureTrend: 'Stable',
                windRisk: 'Low',
                humidityLevel: 'High',
                severeWeather: false,
                outdoorActivity: 'Not Recommended'
            });

        });

    });

});