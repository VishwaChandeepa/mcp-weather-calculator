const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast'

export type WeatherData = {
  latitude: number
  longitude: number
  timezone: string

  current: {
    time: string
    temperature: number
    apparentTemperature: number
    humidity: number
    windSpeed: number
    weatherCode: number
  }

  hourly: {
    time: string[]
    temperature: number[]
    humidity: number[]
    precipitationProbability: number[]
    weatherCode: number[]
  }

  daily: {
    time: string[]
    minTemperature: number[]
    maxTemperature: number[]
    precipitationProbability: number[]
    weatherCode: number[]
  }
}

export async function fetchWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),

    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',

    hourly:
      'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code',

    daily:
      'temperature_2m_min,temperature_2m_max,precipitation_probability_max,weather_code',

    forecast_days: '7',

    timezone: 'auto',
  })

  const response = await fetch(
    `${OPEN_METEO_URL}?${params.toString()}`
  )

  if (!response.ok) {
    throw new Error(
      `Weather API request failed: ${response.status}`
    )
  }

  const data = await response.json()

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,

    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      apparentTemperature:
        data.current.apparent_temperature,
      humidity:
        data.current.relative_humidity_2m,
      windSpeed:
        data.current.wind_speed_10m,
      weatherCode:
        data.current.weather_code,
    },

    hourly: {
      time: data.hourly.time,
      temperature:
        data.hourly.temperature_2m,
      humidity:
        data.hourly.relative_humidity_2m,
      precipitationProbability:
        data.hourly.precipitation_probability,
      weatherCode:
        data.hourly.weather_code,
    },

    daily: {
      time: data.daily.time,
      minTemperature:
        data.daily.temperature_2m_min,
      maxTemperature:
        data.daily.temperature_2m_max,
      precipitationProbability:
        data.daily.precipitation_probability_max,
      weatherCode:
        data.daily.weather_code,
    },
  }
}