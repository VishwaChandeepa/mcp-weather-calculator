
export function analyzeWeather(
    currentTemperature: number,
    forecast: WeatherForecastDay
): WeatherIntelligence {
    const rainRisk =
        calculateRainRisk(
            forecast.rainProbability
        );

    const temperatureTrend =
        calculateTemperatureTrend(
            currentTemperature,
            forecast.averageTemperature
        );

    const windRisk =
        calculateWindRisk(
            forecast.windSpeed
        );

    const humidityLevel =
        calculateHumidityLevel(
            forecast.humidity
        );

    const severeWeather =
        detectSevereWeather(
            forecast.condition
        );

    const outdoorActivity =
        calculateOutdoorActivity(
            rainRisk,
            windRisk,
            severeWeather
        );

    return {
        rainRisk,
        temperatureTrend,
        windRisk,
        humidityLevel,
        severeWeather,
        outdoorActivity
    };
}
export type WeatherForecastDay = {
    date: string;
    minTemperature: number;
    maxTemperature: number;
    averageTemperature: number;
    condition: string;
    rainProbability: number;
    humidity: number;
    windSpeed: number;
};

export type WeatherIntelligence = {
    rainRisk: 'Low' | 'Moderate' | 'High' | 'Very High';
    temperatureTrend: 'Warming' | 'Stable' | 'Cooling';
    windRisk: 'Low' | 'Moderate' | 'High';
    humidityLevel: 'Low' | 'Moderate' | 'High';
    severeWeather: boolean;
    outdoorActivity:
        | 'Recommended'
        | 'Use Caution'
        | 'Not Recommended';
};

export function calculateRainRisk(
    rainProbability: number
): WeatherIntelligence['rainRisk'] {
    if (rainProbability >= 80) {
        return 'Very High';
    }

    if (rainProbability >= 60) {
        return 'High';
    }

    if (rainProbability >= 30) {
        return 'Moderate';
    }

    return 'Low';
}
export function calculateTemperatureTrend(
    currentTemperature: number,
    forecastTemperature: number
): WeatherIntelligence['temperatureTrend'] {
    const difference =
        forecastTemperature - currentTemperature;

    if (difference >= 2) {
        return 'Warming';
    }

    if (difference <= -2) {
        return 'Cooling';
    }

    return 'Stable';
}
export function calculateWindRisk(
    windSpeed: number
): WeatherIntelligence['windRisk'] {
    if (windSpeed >= 40) {
        return 'High';
    }

    if (windSpeed >= 20) {
        return 'Moderate';
    }

    return 'Low';
}
export function calculateHumidityLevel(
    humidity: number
): WeatherIntelligence['humidityLevel'] {
    if (humidity >= 80) {
        return 'High';
    }

    if (humidity >= 50) {
        return 'Moderate';
    }

    return 'Low';
}
export function detectSevereWeather(
    condition: string
): boolean {
    const value = condition.toLowerCase();

    return (
        value.includes('thunderstorm') ||
        value.includes('storm')
    );
}
export function calculateOutdoorActivity(
    rainRisk: WeatherIntelligence['rainRisk'],
    windRisk: WeatherIntelligence['windRisk'],
    severeWeather: boolean
): WeatherIntelligence['outdoorActivity'] {
    if (
        severeWeather ||
        rainRisk === 'Very High' ||
        windRisk === 'High'
    ) {
        return 'Not Recommended';
    }

    if (
        rainRisk === 'High' ||
        windRisk === 'Moderate'
    ) {
        return 'Use Caution';
    }

    return 'Recommended';
}