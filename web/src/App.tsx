
import { useState } from 'react'

type WeatherData = {
  city: string
  country: string
  temperature: string
  feelsLike: string
  condition: string
  humidity: string
  windSpeed: string
  visibility: string
  pressure: string
}

type ForecastDay = {
  date: string
  minTemperature: string
  maxTemperature: string
  averageTemperature: string
  condition: string
}

function App() {
  const [city, setCity] = useState('Ginigathena')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // AI Assistant state
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const searchWeather = async () => {
    if (!city.trim()) {
      setError('Please enter a city name.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Get current weather
      const response = await fetch(
        `http://localhost:3000/api/weather?city=${encodeURIComponent(city)}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Could not get weather data')
      }

      setWeather(data)

      // Get 3-day forecast
      const forecastResponse = await fetch(
        `http://localhost:3000/api/forecast?city=${encodeURIComponent(city)}&days=3`
      )

      const forecastData = await forecastResponse.json()

      if (!forecastResponse.ok) {
        throw new Error(
          forecastData.error || 'Could not get forecast data'
        )
      }

      setForecast(forecastData.forecast)
    } catch (error) {
      console.error(error)

      setWeather(null)
      setForecast([])

      setError(
        error instanceof Error
          ? error.message
          : 'Could not get weather data.'
      )
    } finally {
      setLoading(false)
    }
  }

  const askAI = async () => {
    if (!aiQuestion.trim()) {
      setAiError('Please enter a question.')
      return
    }

    setAiLoading(true)
    setAiError('')
    setAiAnswer('')

    try {
      const response = await fetch(
        'http://localhost:3000/api/ai',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: aiQuestion,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not get AI response'
        )
      }

      setAiAnswer(data.answer)
    } catch (error) {
      console.error(error)

      setAiError(
        error instanceof Error
          ? error.message
          : 'Could not get AI response.'
      )
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold">
              🌦️ MCP Weather Intelligence
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              AI-powered weather intelligence with MCP
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">

            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

            <span className="text-sm text-emerald-300">
              MCP Online
            </span>

          </div>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Search */}
        <section className="mb-8">

          <p className="mb-2 text-sm font-medium text-slate-400">
            Search Location
          </p>

          <div className="flex max-w-2xl gap-3">

            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  searchWeather()
                }
              }}
              placeholder="Enter any city..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 outline-none placeholder:text-slate-500 focus:border-sky-500"
            />

            <button
              onClick={searchWeather}
              disabled={loading}
              className="rounded-xl bg-sky-500 px-6 py-3 font-semibold transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>

          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}

        </section>

        {/* Current Weather */}
        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">

            <div>

              <p className="text-sm text-slate-400">
                Current Weather
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {weather?.city || city || 'Unknown City'}
              </h2>

              {weather?.country && (
                <p className="mt-1 text-sm text-slate-500">
                  {weather.country}
                </p>
              )}

              <div className="mt-6 flex items-center gap-5">

                <span className="text-7xl">
                  {getWeatherIcon(weather?.condition)}
                </span>

                <div>

                  <p className="text-6xl font-bold">
                    {weather?.temperature || '--'}
                  </p>

                  <p className="mt-2 text-lg text-slate-400">
                    {weather?.condition || 'Search for weather'}
                  </p>

                </div>

              </div>

            </div>

            {/* Weather Statistics */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-2">

              <WeatherStat
                label="Feels Like"
                value={weather?.feelsLike || '--'}
              />

              <WeatherStat
                label="Humidity"
                value={weather?.humidity || '--'}
              />

              <WeatherStat
                label="Wind"
                value={weather?.windSpeed || '--'}
              />

              <WeatherStat
                label="Visibility"
                value={weather?.visibility || '--'}
              />

              <WeatherStat
                label="Pressure"
                value={weather?.pressure || '--'}
              />

            </div>

          </div>

        </section>

        {/* Forecast */}
        <section className="mb-8">

          <div className="mb-4">

            <p className="text-sm text-slate-400">
              Upcoming Weather
            </p>

            <h2 className="text-2xl font-bold">
              3-Day Forecast
            </h2>

          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {forecast.length > 0 ? (
              forecast.map((day, index) => (
                <ForecastCard
                  key={day.date}
                  day={getForecastDayName(day.date, index)}
                  icon={getWeatherIcon(day.condition)}
                  condition={day.condition}
                  temperature={`${day.minTemperature} - ${day.maxTemperature}`}
                />
              ))
            ) : (
              <>
                <ForecastCard
                  day="Today"
                  icon={getWeatherIcon(weather?.condition)}
                  condition={weather?.condition || '--'}
                  temperature={weather?.temperature || '--'}
                />

                <ForecastCard
                  day="Tomorrow"
                  icon="🌧️"
                  condition="Search for forecast"
                  temperature="--"
                />

                <ForecastCard
                  day="Day 3"
                  icon="🌤️"
                  condition="Search for forecast"
                  temperature="--"
                />
              </>
            )}

          </div>

        </section>

        {/* Weather Intelligence */}
        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">

            <div>

              <p className="text-sm font-medium text-sky-400">
                Weather Intelligence
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                Intelligence Capabilities
              </h2>

              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Real-time weather data, forecasting, and AI-powered
                insights delivered through Model Context Protocol.
              </p>

            </div>

            <div className="text-sm text-slate-500">
              Powered by MCP + Gemini
            </div>

          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <CapabilityCard
              icon="🌤️"
              name="Current Conditions"
              description="Real-time weather conditions for any location."
            />

            <CapabilityCard
              icon="📅"
              name="Forecast Intelligence"
              description="Multi-day forecasts with temperature and weather trends."
            />

            <CapabilityCard
              icon="🌧️"
              name="Precipitation Analysis"
              description="Understand rain and precipitation conditions."
            />

            <CapabilityCard
              icon="🌡️"
              name="Temperature Trends"
              description="Analyze temperature changes across forecast periods."
            />

            <CapabilityCard
              icon="💨"
              name="Wind Intelligence"
              description="Monitor wind speed and atmospheric conditions."
            />

            <CapabilityCard
              icon="🤖"
              name="AI Weather Insights"
              description="Ask natural-language questions and receive intelligent weather analysis."
            />

          </div>

        </section>

        {/* AI Assistant */}
        <section className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 p-8">

          <div className="flex items-center gap-3">

            <span className="text-3xl">
              🤖
            </span>

            <div>

              <h2 className="text-2xl font-bold">
                AI Weather Assistant
              </h2>

              <p className="text-sm text-slate-400">
                Ask natural-language questions and let Gemini use
                weather tools through MCP.
              </p>

            </div>

          </div>

          {/* AI Input */}
          <div className="mt-6 flex gap-3">

            <input
              type="text"
              value={aiQuestion}
              onChange={(event) => setAiQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  askAI()
                }
              }}
              placeholder="Ask something about the weather..."
              disabled={aiLoading}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-5 py-3 outline-none placeholder:text-slate-500 focus:border-sky-500 disabled:opacity-50"
            />

            <button
              onClick={askAI}
              disabled={aiLoading}
              className="rounded-xl bg-sky-500 px-6 py-3 font-semibold transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {aiLoading ? 'Thinking...' : 'Ask AI'}
            </button>

          </div>

          {/* AI Error */}
          {aiError && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">
                {aiError}
              </p>
            </div>
          )}

          {/* AI Response */}
          {aiAnswer && (
            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950 p-6">

              <div className="flex items-center gap-2">

                <span className="text-xl">
                  ✨
                </span>

                <p className="text-sm font-semibold text-sky-400">
                  Gemini Weather Intelligence
                </p>

              </div>

              <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {aiAnswer}
              </div>

            </div>
          )}

        </section>

      </main>

    </div>
  )
}

/* Forecast Day Name */
function getForecastDayName(
  date: string,
  index: number
) {
  if (index === 0) {
    return 'Today'
  }

  if (index === 1) {
    return 'Tomorrow'
  }

  return new Date(date).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
    }
  )
}

/* Weather Icon */
function getWeatherIcon(condition?: string) {
  if (!condition) {
    return '🌤️'
  }

  const value = condition.toLowerCase()

  if (
    value.includes('rain') ||
    value.includes('drizzle') ||
    value.includes('shower')
  ) {
    return '🌧️'
  }

  if (
    value.includes('cloud') ||
    value.includes('overcast')
  ) {
    return '☁️'
  }

  if (
    value.includes('mist') ||
    value.includes('fog')
  ) {
    return '🌫️'
  }

  if (
    value.includes('sun') ||
    value.includes('clear')
  ) {
    return '☀️'
  }

  if (
    value.includes('thunder') ||
    value.includes('storm')
  ) {
    return '⛈️'
  }

  return '🌤️'
}

/* Weather Statistic */
function WeatherStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>

    </div>
  )
}

/* Forecast Card */
function ForecastCard({
  day,
  icon,
  condition,
  temperature,
}: {
  day: string
  icon: string
  condition: string
  temperature: string
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <p className="text-sm text-slate-400">
        {day}
      </p>

      <div className="mt-5 flex items-center justify-between">

        <span className="text-4xl">
          {icon}
        </span>

        <span className="text-2xl font-bold">
          {temperature}
        </span>

      </div>

      <p className="mt-4 text-slate-400">
        {condition}
      </p>

    </div>
  )
}

/* Weather Intelligence Capability Card */
function CapabilityCard({
  icon,
  name,
  description,
}: {
  icon: string
  name: string
  description: string
}) {
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-950 p-5 transition duration-200 hover:border-sky-500/40 hover:bg-slate-900">

      <div className="flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-2xl">
          {icon}
        </div>

        <div>

          <h3 className="font-semibold text-white">
            {name}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {description}
          </p>

        </div>

      </div>

    </div>
  )
}

export default App
