import {
    analyzeWeather,
    type WeatherForecastDay
} from './weatherIntelligence.js';

const currentTemperature = 23;

const forecast: WeatherForecastDay = {
    date: '2026-10-03',
    minTemperature: 21.5,
    maxTemperature: 29.3,
    averageTemperature: 24.2,
    condition: 'Drizzle',
    rainProbability: 99,
    humidity: 87,
    windSpeed: 9.1
};

const intelligence =
    analyzeWeather(
        currentTemperature,
        forecast
    );

console.log(
    'Weather Intelligence:\n'
);

console.log(
    JSON.stringify(
        intelligence,
        null,
        2
    )
);