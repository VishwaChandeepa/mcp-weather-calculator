import assert from 'node:assert/strict';

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

console.log(
    'Running Weather Intelligence automated tests...\n'
);

// 1. Very High Rain Risk
assert.equal(
    calculateRainRisk(90),
    'Very High'
);

// 2. Moderate Rain Risk
assert.equal(
    calculateRainRisk(45),
    'Moderate'
);

// 3. Low Heat Risk
assert.equal(
    calculateHeatRisk(28),
    'Low'
);

// 4. Moderate Heat Risk
assert.equal(
    calculateHeatRisk(32),
    'Moderate'
);

// 5. High Heat Risk
assert.equal(
    calculateHeatRisk(37),
    'High'
);

// 6. Extreme Heat Risk
assert.equal(
    calculateHeatRisk(42),
    'Extreme'
);

// 7. High Wind Risk
assert.equal(
    calculateWindRisk(45),
    'High'
);

// 8. High Humidity
assert.equal(
    calculateHumidityLevel(90),
    'High'
);

// 9. Warming Temperature
assert.equal(
    calculateTemperatureTrend(23, 27),
    'Warming'
);

// 10. Cooling Temperature
assert.equal(
    calculateTemperatureTrend(23, 20),
    'Cooling'
);

// 11. Thunderstorm Detection
assert.equal(
    detectSevereWeather('Thunderstorm'),
    true
);

// 12. Outdoor Activity - Very High Rain
assert.equal(
    calculateOutdoorActivity(
        'Very High',
        'Low',
        false
    ),
    'Not Recommended'
);

// 13. Outdoor Activity - Moderate Conditions
assert.equal(
    calculateOutdoorActivity(
        'Moderate',
        'Low',
        false
    ),
    'Recommended'
);

// 14. Complete Weather Intelligence Analysis
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

assert.deepEqual(
    intelligence,
    {
        rainRisk: 'Very High',
        heatRisk: 'High',
        temperatureTrend: 'Stable',
        windRisk: 'Low',
        humidityLevel: 'High',
        severeWeather: false,
        outdoorActivity: 'Not Recommended'
    }
);

console.log(
    '✓ Rain risk tests passed'
);

console.log(
    '✓ Heat risk tests passed'
);

console.log(
    '✓ Temperature trend tests passed'
);

console.log(
    '✓ Wind risk tests passed'
);

console.log(
    '✓ Humidity tests passed'
);

console.log(
    '✓ Severe weather tests passed'
);

console.log(
    '✓ Outdoor activity tests passed'
);

console.log(
    '✓ Complete intelligence analysis passed'
);

console.log(
    '\nAll Weather Intelligence tests passed successfully! 🎉'
);