import { useState, useEffect, useRef } from "react";
import {
  Menu,
  MapPin,
  Search,
  LocateFixed,
  Sun,
  Moon,
  Bell,
  Settings,
  ChevronDown,
  ChevronUp,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Thermometer,
  Sparkles,
  Send,
  X,
  MessageSquare,
  Bot,
  User as UserIcon,
  Loader2,
  Calendar,
  TrendingUp,
} from "lucide-react";

/* -------------------------------------------------------------
   TYPES
------------------------------------------------------------- */
type Unit = "F" | "C";

type Place = {
  name: string;
  country: string;
  lat: number;
  lon: number;
};

type HourlyItem = {
  time: string;
  hourLabel: string;
  temp: number;
  weatherCode: number;
  condition: string;
  windSpeed: number;
  humidity: number;
};

type DailyItem = {
  date: string;
  dayLabel: string;
  weatherCode: number;
  condition: string;
  maxTemp: number;
  minTemp: number;
  avgTemp: number;
  rainProb: number;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
};

type WeatherState = {
  place: Place;
  currentTimeStr: string;
  temp: number;
  feelsLike: number;
  condition: string;
  weatherCode: number;
  isDay: boolean;
  airQuality: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  visibility: number; // in meters
  pressure: number; // in hPa
  uvIndex: number;
  sunrise: string;
  sunset: string;
  todayHours: HourlyItem[];
  tomorrowHours: HourlyItem[];
  tenDays: DailyItem[];
  summaryText: string;
};

type ChatMessage = {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
};

/* -------------------------------------------------------------
   POPULAR / QUICK ACCESS CITIES
------------------------------------------------------------- */
const POPULAR_CITIES: Place[] = [
  { name: "Kandy", country: "Central Province, Sri Lanka", lat: 7.2906, lon: 80.6337 },
  { name: "Colombo", country: "Western Province, Sri Lanka", lat: 6.9271, lon: 79.8612 },
  { name: "London", country: "England, United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "New York", country: "New York, United States", lat: 40.7128, lon: -74.006 },
  { name: "Tokyo", country: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Paris", country: "Île-de-France, France", lat: 48.8566, lon: 2.3522 },
  { name: "Dubai", country: "Dubai, United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  { name: "Khulna", country: "Khulna Division, Bangladesh", lat: 22.8456, lon: 89.5403 },
];

/* -------------------------------------------------------------
   HELPERS & WEATHER CODE PARSERS
------------------------------------------------------------- */
function parseWeatherCode(code: number): { label: string; type: "clear" | "cloudy" | "rain" | "storm" | "snow" | "fog" } {
  if (code === 0) return { label: "Clear Sky", type: "clear" };
  if (code === 1 || code === 2) return { label: "Mostly Cloudy", type: "cloudy" };
  if (code === 3) return { label: "Overcast", type: "cloudy" };
  if (code === 45 || code === 48) return { label: "Fog", type: "fog" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", type: "rain" };
  if (code >= 61 && code <= 67) return { label: "Rainy", type: "rain" };
  if (code >= 71 && code <= 77) return { label: "Snow", type: "snow" };
  if (code >= 80 && code <= 82) return { label: "Rain Showers", type: "rain" };
  if (code >= 95 && code <= 99) return { label: "Thunderstorm", type: "storm" };
  return { label: "Mostly Cloudy", type: "cloudy" };
}

// Calculate dew point: Tdp ~ T - ((100 - RH) / 5) in Celsius
function calcDewPointC(tempC: number, rh: number): number {
  return tempC - (100 - rh) / 5;
}

/* -------------------------------------------------------------
   3D WEATHER ILLUSTRATIONS (High-Def SVG)
------------------------------------------------------------- */
function WeatherIllustration({ type, isDay = true, size = 72 }: { type: string; isDay?: boolean; size?: number }) {
  if (type === "storm") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="cloudDarkGrad" x1="20" y1="20" x2="70" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#334155" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="boltGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fef08a" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
          <filter id="boltGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#facc15" floodOpacity="0.7" />
          </filter>
        </defs>
        <path
          d="M32 66H70C78.8 66 86 58.8 86 50C86 41.5 79.4 34.6 71 34.1C69.3 22.8 59.6 14 48 14C37.2 14 28.1 21.7 25.5 32.2C17.9 33.3 12 39.8 12 47.7C12 56.7 19.3 64 28.3 64L32 66Z"
          fill="url(#cloudDarkGrad)"
        />
        <polygon
          points="48,50 36,68 45,68 39,88 62,64 50,64"
          fill="url(#boltGrad)"
          filter="url(#boltGlow)"
        />
      </svg>
    );
  }

  if (type === "rain") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <radialGradient id="sunPeeing" cx="50%" cy="50%" r="50%">
            <stop stopColor="#fef08a" />
            <stop offset="1" stopColor="#f59e0b" />
          </radialGradient>
          <linearGradient id="rainCloudGrad" x1="20" y1="20" x2="70" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#475569" />
            <stop offset="1" stopColor="#1e293b" />
          </linearGradient>
          <filter id="sunHalo" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx="36" cy="36" r="18" fill="url(#sunPeeing)" filter="url(#sunHalo)" />
        <path
          d="M36 70H74C81.7 70 88 63.7 88 56C88 48.6 82.2 42.6 75 42.1C73.5 32.3 65.1 24.6 55 24.6C45.6 24.6 37.7 31.3 35.4 40.5C28.8 41.5 24 47.1 24 54C24 62.8 31.2 70 40 70H36Z"
          fill="url(#rainCloudGrad)"
        />
        <line x1="42" y1="74" x2="36" y2="86" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
        <line x1="58" y1="74" x2="52" y2="86" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
        <line x1="72" y1="74" x2="66" y2="86" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "clear") {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <defs>
          <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
            <stop stopColor="#fef9c3" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#ea580c" />
          </radialGradient>
          <filter id="sunGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {isDay ? (
          <>
            <circle cx="50" cy="50" r="26" fill="#facc15" opacity="0.3" filter="url(#sunGlowFilter)" />
            <circle cx="50" cy="50" r="22" fill="url(#sunCore)" />
          </>
        ) : (
          <path
            d="M60 25C44 25 31 38 31 54C31 70 44 83 60 83C66.5 83 72.5 80.8 77.3 77.2C65.5 74.8 56.6 64.5 56.6 52C56.6 39.5 65.5 29.2 77.3 26.8C72.5 23.2 66.5 25 60 25Z"
            fill="#38bdf8"
          />
        )}
      </svg>
    );
  }

  // Default: Cloudy
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id="sunSoft" cx="50%" cy="50%" r="50%">
          <stop stopColor="#fde047" />
          <stop offset="1" stopColor="#eab308" />
        </radialGradient>
        <linearGradient id="cloudGradLight" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#64748b" />
          <stop offset="1" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <circle cx="64" cy="36" r="16" fill="url(#sunSoft)" opacity="0.9" />
      <path
        d="M32 68H70C77.7 68 84 61.7 84 54C84 46.6 78.2 40.6 71 40.1C69.5 30.3 61.1 22.6 51 22.6C41.6 22.6 33.7 29.3 31.4 38.5C24.8 39.5 20 45.1 20 52C20 60.8 27.2 68 36 68H32Z"
        fill="url(#cloudGradLight)"
      />
    </svg>
  );
}

/* -------------------------------------------------------------
   DUAL ARC COMPONENT: Sun & Moon Trajectory (Clean Visible Light/Dark Mode)
------------------------------------------------------------- */
function SunMoonDualArcs({
  sunriseStr = "6:00 AM",
  sunsetStr = "5:33 PM",
  currentTime,
  theme,
}: {
  sunriseStr?: string;
  sunsetStr?: string;
  currentTime?: string;
  theme: "dark" | "light";
}) {
  const width = 220;
  const height = 48;
  const r = 88;
  const cx = width / 2;
  const cy = 48;

  // Compute sun progress from currentTime or current local time
  let hour = new Date().getHours() + new Date().getMinutes() / 60;
  if (currentTime) {
    const match = currentTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3]?.toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      hour = h + m / 60;
    }
  }

  // Sun progress between 6 AM and 6 PM
  const sunProgress = Math.max(0.08, Math.min(0.92, (hour - 5.5) / 12.5));
  // Moon progress between 6 PM and 6 AM
  const moonProgress = Math.max(0.08, Math.min(0.92, ((hour + 6) % 24) / 24));

  const sunAngle = Math.PI - sunProgress * Math.PI;
  const sunX = cx + r * Math.cos(sunAngle);
  const sunY = cy - r * Math.sin(sunAngle) * 0.44;

  const moonAngle = Math.PI - moonProgress * Math.PI;
  const moonX = cx + r * Math.cos(moonAngle);
  const moonY = cy - r * Math.sin(moonAngle) * 0.44;

  const trackStroke = theme === "light" ? "rgba(15, 23, 42, 0.16)" : "rgba(255, 255, 255, 0.18)";

  return (
    <div className="dual-arc-container">
      {/* Sun Arc Row */}
      <div className="arc-row">
        <div className="arc-time-label">
          <span className="arc-time-sub">Sunrise</span>
          <span className="arc-time-val">{sunriseStr}</span>
        </div>

        <svg className="arc-svg-track" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <filter id="sunDotGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#facc15" floodOpacity="0.9" />
            </filter>
          </defs>
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r * 0.44} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={trackStroke}
            strokeWidth="2.5"
            strokeDasharray="3 4"
          />
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r * 0.44} 0 0 1 ${sunX} ${sunY}`}
            fill="none"
            stroke="#facc15"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx={sunX} cy={sunY} r="5.5" fill="#facc15" filter="url(#sunDotGlow)" />
        </svg>

        <div className="arc-time-label">
          <span className="arc-time-sub">Sunset</span>
          <span className="arc-time-val">{sunsetStr}</span>
        </div>
      </div>

      {/* Moon Arc Row */}
      <div className="arc-row">
        <div className="arc-time-label">
          <span className="arc-time-sub">Moonrise</span>
          <span className="arc-time-val">{sunriseStr}</span>
        </div>

        <svg className="arc-svg-track" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <filter id="moonDotGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#38bdf8" floodOpacity="0.9" />
            </filter>
          </defs>
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r * 0.44} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke={trackStroke}
            strokeWidth="2.5"
            strokeDasharray="3 4"
          />
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r * 0.44} 0 0 1 ${moonX} ${moonY}`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx={moonX} cy={moonY} r="5.5" fill="#38bdf8" filter="url(#moonDotGlow)" />
        </svg>

        <div className="arc-time-label">
          <span className="arc-time-sub">Moonset</span>
          <span className="arc-time-val">{sunsetStr}</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   MONTHLY CAST MODAL COMPONENT
------------------------------------------------------------- */
function MonthlyCastModal({
  isOpen,
  onClose,
  weather,
  unit,
  toUnitTemp,
}: {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherState | null;
  unit: Unit;
  toUnitTemp: (c: number) => number;
}) {
  if (!isOpen || !weather) return null;

  const days = weather.tenDays;
  const maxTemps = days.map((d) => toUnitTemp(d.maxTemp));
  const minTemps = days.map((d) => toUnitTemp(d.minTemp));
  const highest = Math.max(...maxTemps);
  const lowest = Math.min(...minTemps);
  const range = Math.max(1, highest - lowest);

  // SVG Trend Chart points
  const chartWidth = 720;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 25;
  const stepX = (chartWidth - paddingX * 2) / Math.max(1, days.length - 1);

  const maxPoints = days.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = paddingY + (highest - toUnitTemp(d.maxTemp)) * ((chartHeight - paddingY * 2) / range);
    return { x, y, temp: toUnitTemp(d.maxTemp), day: d.dayLabel };
  });

  const minPoints = days.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = paddingY + (highest - toUnitTemp(d.minTemp)) * ((chartHeight - paddingY * 2) / range);
    return { x, y, temp: toUnitTemp(d.minTemp) };
  });

  const maxPathD = maxPoints.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), "");
  const minPathD = minPoints.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), "");

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Calendar size={20} color="#0077ff" />
            <h2 className="modal-title">Extended 10-Day & Monthly Forecast</h2>
            <span className="modal-city-badge">
              {weather.place.name}, {weather.place.country}
            </span>
          </div>

          <button className="icon-btn-ghost" onClick={onClose} aria-label="Close Modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Temperature Trend Chart */}
          <div className="trend-chart-card">
            <div className="trend-chart-title">
              <TrendingUp size={16} color="#38bdf8" />
              <span>10-Day Temperature Range & Trends (°{unit})</span>
            </div>

            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0077ff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* High curve */}
              <path d={maxPathD} fill="none" stroke="#0077ff" strokeWidth="3" strokeLinecap="round" />
              {/* Low curve */}
              <path d={minPathD} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="4 4" />

              {/* Data Dots and Values */}
              {maxPoints.map((p, idx) => (
                <g key={`max-${idx}`}>
                  <circle cx={p.x} cy={p.y} r="4.5" fill="#0077ff" stroke="#ffffff" strokeWidth="2" />
                  <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
                    {p.temp}°
                  </text>
                  <text x={p.x} y={chartHeight - 4} textAnchor="middle" fontSize="11" fill="#8493b2">
                    {p.day.split(" ")[0]}
                  </text>
                </g>
              ))}

              {minPoints.map((p, idx) => (
                <g key={`min-${idx}`}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                  <text x={p.x} y={p.y + 16} textAnchor="middle" fontSize="10" fill="#8493b2">
                    {p.temp}°
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Daily Cards Grid */}
          <div className="modal-days-grid">
            {days.map((item, idx) => (
              <div key={idx} className="modal-day-card">
                <div className="flex items-center gap-3">
                  <WeatherIllustration type={parseWeatherCode(item.weatherCode).type} size={42} />
                  <div>
                    <div className="text-sm font-bold">{item.dayLabel}</div>
                    <div className="text-xs text-slate-400">{item.condition}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold">
                    {toUnitTemp(item.maxTemp)}° / <span className="text-xs text-slate-400">{toUnitTemp(item.minTemp)}°</span>
                  </div>
                  <div className="text-xs text-sky-400 font-semibold">Rain: {item.rainProb}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------- */
export default function App() {
  // Theme state: dark / light
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Temperature unit: F or C (Fahrenheit by default to match screenshot)
  const [unit, setUnit] = useState<Unit>("F");
  const [unitMenuOpen, setUnitMenuOpen] = useState(false);

  // Search states
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Search container ref for click-outside detection
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Tab state in right column: "today" | "tomorrow" | "10days"
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow" | "10days">("tomorrow");

  // Forecast list expansion state
  const [forecastExpanded, setForecastExpanded] = useState(false);

  // Monthly Cast Modal state
  const [monthlyModalOpen, setMonthlyModalOpen] = useState(false);

  // Weather data
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Chat Bar state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Hello! I am your SkyCast AI Weather Assistant. Ask me anything about current weather conditions, travel clothing advice, rain predictions, or forecasts!",
      timestamp: "12:00 PM",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync data-theme attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Click-outside listener for search dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-scroll chat drawer
  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen]);

  /* -------------------------------------------------------------
     UNIT CONVERTERS
  ------------------------------------------------------------- */
  const toUnitTemp = (celsius: number) => {
    if (unit === "F") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const toUnitWind = (kmh: number) => {
    if (unit === "F") {
      const mph = Math.round(kmh * 0.621371);
      return `${mph} mph`;
    }
    return `${Math.round(kmh)} km/h`;
  };

  const toUnitPressure = (hpa: number) => {
    if (unit === "F") {
      return `${(hpa * 0.02953).toFixed(2)} in`;
    }
    return `${Math.round(hpa)} hPa`;
  };

  const toUnitVisibility = (meters: number) => {
    if (unit === "F") {
      const miles = meters / 1609.34;
      return `${miles >= 10 ? Math.round(miles) : miles.toFixed(1)} mi`;
    }
    const km = meters / 1000;
    return `${km >= 10 ? Math.round(km) : km.toFixed(1)} km`;
  };

  /* -------------------------------------------------------------
     FETCH WEATHER DATA FROM OPEN-METEO
  ------------------------------------------------------------- */
  async function fetchCityWeather(targetPlace: Place) {
    setLoading(true);
    setError(null);

    try {
      const forecastUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${targetPlace.lat}&longitude=${targetPlace.lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,is_day` +
        `&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation_probability,visibility` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max` +
        `&forecast_days=10&timezone=auto`;

      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${targetPlace.lat}&longitude=${targetPlace.lon}&current=us_aqi`;

      const [forecastRes, aqiRes] = await Promise.all([
        fetch(forecastUrl),
        fetch(aqiUrl).catch(() => null),
      ]);

      if (!forecastRes.ok) {
        throw new Error("Unable to retrieve weather data.");
      }

      const fData = await forecastRes.json();
      const aqiData = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

      const current = fData.current;
      const hourly = fData.hourly;
      const daily = fData.daily;

      // Parse current time
      const dateObj = new Date(current.time);
      const hours12 = dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

      // Build Hourly list for Today & Tomorrow (8 key points each: 1AM, 4AM, 7AM, 10AM, 1PM, 4PM, 7PM, 10PM)
      const parseHourSegment = (startIdx: number): HourlyItem[] => {
        const targetOffsets = [1, 4, 7, 10, 13, 16, 19, 22];
        return targetOffsets.map((offset) => {
          const idx = startIdx + offset;
          const timeRaw = hourly.time[idx] || hourly.time[startIdx];
          const timeDate = new Date(timeRaw);
          const hourLabel = timeDate.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
          const code = hourly.weather_code[idx] ?? 0;
          return {
            time: timeRaw,
            hourLabel,
            temp: hourly.temperature_2m[idx] ?? current.temperature_2m,
            weatherCode: code,
            condition: parseWeatherCode(code).label,
            windSpeed: hourly.wind_speed_10m[idx] ?? current.wind_speed_10m,
            humidity: hourly.relative_humidity_2m[idx] ?? current.relative_humidity_2m,
          };
        });
      };

      const todayHours = parseHourSegment(0);
      const tomorrowHours = parseHourSegment(24);

      // Build 10 Days list
      const tenDays: DailyItem[] = daily.time.map((dStr: string, idx: number) => {
        const dObj = new Date(dStr);
        const dayLabel =
          idx === 0
            ? "Today"
            : idx === 1
            ? "Tomorrow"
            : dObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        const code = daily.weather_code[idx] ?? 0;
        return {
          date: dStr,
          dayLabel,
          weatherCode: code,
          condition: parseWeatherCode(code).label,
          maxTemp: daily.temperature_2m_max[idx],
          minTemp: daily.temperature_2m_min[idx],
          avgTemp: daily.temperature_2m_mean
            ? daily.temperature_2m_mean[idx]
            : (daily.temperature_2m_max[idx] + daily.temperature_2m_min[idx]) / 2,
          rainProb: daily.precipitation_probability_max[idx] ?? 0,
          windSpeed: daily.wind_speed_10m_max[idx] ?? 15,
          humidity: 60,
          uvIndex: daily.uv_index_max[idx] ?? 5,
          sunrise: daily.sunrise[idx]
            ? new Date(daily.sunrise[idx]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
            : "6:00 AM",
          sunset: daily.sunset[idx]
            ? new Date(daily.sunset[idx]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
            : "5:33 PM",
        };
      });

      // Format sunrise and sunset for current day
      const todaySunrise = daily.sunrise?.[0]
        ? new Date(daily.sunrise[0]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        : "6:00 AM";
      const todaySunset = daily.sunset?.[0]
        ? new Date(daily.sunset[0]).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        : "5:33 PM";

      // Summary text
      const highTempF = Math.round((daily.temperature_2m_max[0] * 9) / 5 + 32);
      const condLabel = parseWeatherCode(current.weather_code).label.toLowerCase();
      const summaryText = `There will be mostly ${condLabel} skies. The high will be ${
        unit === "F" ? highTempF : Math.round(daily.temperature_2m_max[0])
      }°`;

      const visibilityRaw = hourly.visibility?.[0] ?? 8200;

      setWeather({
        place: targetPlace,
        currentTimeStr: hours12,
        temp: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        condition: parseWeatherCode(current.weather_code).label,
        weatherCode: current.weather_code,
        isDay: current.is_day === 1,
        airQuality: aqiData?.current?.us_aqi ?? 182,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        humidity: current.relative_humidity_2m,
        visibility: visibilityRaw,
        pressure: current.surface_pressure,
        uvIndex: daily.uv_index_max?.[0] ?? 6.2,
        sunrise: todaySunrise,
        sunset: todaySunset,
        todayHours,
        tomorrowHours,
        tenDays,
        summaryText,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather.");
    } finally {
      setLoading(false);
    }
  }

  // Initial load: Khulna, Bangladesh as requested
  useEffect(() => {
    fetchCityWeather({
      name: "Khulna",
      country: "Bangladesh",
      lat: 22.8456,
      lon: 89.5403,
    });
  }, []);

  /* -------------------------------------------------------------
     GEOCODING SEARCH AUTOCOMPLETE
  ------------------------------------------------------------- */
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setHighlightedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query.trim()
          )}&count=6&language=en&format=json`
        );
        const data = await res.json();
        if (data.results) {
          const list: Place[] = data.results.map((item: any) => ({
            name: item.name,
            country: [item.admin1, item.country].filter(Boolean).join(", "),
            lat: item.latitude,
            lon: item.longitude,
          }));
          setSuggestions(list);
          setHighlightedIndex(0);
        } else {
          setSuggestions([]);
          setHighlightedIndex(-1);
        }
      } catch {
        setSuggestions([]);
        setHighlightedIndex(-1);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard navigation inside search input
  async function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const activeList = query.trim().length >= 2 ? suggestions : POPULAR_CITIES;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < activeList.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : activeList.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && activeList[highlightedIndex]) {
        selectPlace(activeList[highlightedIndex]);
      } else if (suggestions.length > 0) {
        selectPlace(suggestions[0]);
      } else if (query.trim().length > 0) {
        // Direct search fallback
        setSearchLoading(true);
        try {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
              query.trim()
            )}&count=1&language=en&format=json`
          );
          const data = await res.json();
          if (data.results?.[0]) {
            const top = data.results[0];
            selectPlace({
              name: top.name,
              country: [top.admin1, top.country].filter(Boolean).join(", "),
              lat: top.latitude,
              lon: top.longitude,
            });
          }
        } catch {
          // ignore
        } finally {
          setSearchLoading(false);
        }
      }
    } else if (e.key === "Escape") {
      setSearchFocused(false);
      setSuggestions([]);
    }
  }

  function selectPlace(place: Place) {
    setQuery("");
    setSuggestions([]);
    setSearchFocused(false);
    fetchCityWeather(place);
  }

  // Current GPS Geolocation with Reverse Geocode for Real City Name
  function handleUseLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setSearchLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let detectedCity = "My Location";
        let detectedCountry = "";

        try {
          const revRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            detectedCity = revData.city || revData.locality || revData.principalSubdivision || "Current Location";
            detectedCountry = revData.countryName || "";
          }
        } catch {
          // Fallback if reverse geocode is slow
        } finally {
          setSearchLoading(false);
          selectPlace({
            name: detectedCity,
            country: detectedCountry,
            lat: latitude,
            lon: longitude,
          });
        }
      },
      () => {
        setSearchLoading(false);
        alert("Location access denied or unavailable.");
      }
    );
  }

  /* -------------------------------------------------------------
     AI CHAT SUBMISSION (POST /api/ai with local reasoning fallback)
  ------------------------------------------------------------- */
  async function handleSendAiQuestion(questionText?: string) {
    const q = (questionText || chatInput).trim();
    if (!q || isAiThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatOpen(true);
    setIsAiThinking(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (response.ok) {
        const resJson = await response.json();
        if (resJson.answer) {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "assistant",
              text: resJson.answer,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ]);
          setIsAiThinking(false);
          return;
        }
      }
      throw new Error("Backend response unavailable, falling back to local reasoning.");
    } catch {
      setTimeout(() => {
        let answer = "";
        const lowerQ = q.toLowerCase();

        if (weather) {
          const tempDisplay = `${toUnitTemp(weather.temp)}°${unit}`;
          const feelsDisplay = `${toUnitTemp(weather.feelsLike)}°${unit}`;
          const currentCity = weather.place.name;

          if (lowerQ.includes("umbrella") || lowerQ.includes("rain")) {
            const hasRain = weather.weatherCode >= 51 && weather.weatherCode <= 82;
            answer = hasRain
              ? `☔ Yes, you should carry an umbrella today in ${currentCity}! Rain conditions are detected with a high probability.`
              : `☀️ It looks dry right now in ${currentCity} (${weather.condition}). Rain is not significantly expected in the immediate hours, so you probably don't need an umbrella.`;
          } else if (lowerQ.includes("wear") || lowerQ.includes("clothes") || lowerQ.includes("clothing")) {
            if (weather.feelsLike >= 28) {
              answer = `👕 It feels warm at ${feelsDisplay} in ${currentCity}. Wear lightweight, breathable cotton fabrics, stay hydrated, and wear UV sunglasses if stepping outside.`;
            } else if (weather.feelsLike >= 18) {
              answer = `👔 Temperatures are comfortable (${tempDisplay}, feels like ${feelsDisplay}). A light shirt or casual layer will be perfect.`;
            } else {
              answer = `🧥 It is cool (${tempDisplay}, feels like ${feelsDisplay}). Be sure to layer up with a jacket or sweater, especially if you're out in the evening wind (${toUnitWind(
                weather.windSpeed
              )}).`;
            }
          } else if (lowerQ.includes("exercise") || lowerQ.includes("run") || lowerQ.includes("outdoor")) {
            if (weather.airQuality > 150) {
              answer = `⚠️ Air quality index is elevated (${weather.airQuality}) in ${currentCity}. Heavy outdoor cardio might cause slight irritation for sensitive individuals; indoor workouts or morning jogs are recommended.`;
            } else {
              answer = `🏃 Outdoor conditions are favorable! Current temp is ${tempDisplay} with ${toUnitWind(
                weather.windSpeed
              )} winds. Have a great workout!`;
            }
          } else {
            answer = `Currently in ${currentCity}, it is ${tempDisplay} (${weather.condition}) with a feels-like temperature of ${feelsDisplay}. Wind is blowing at ${toUnitWind(
              weather.windSpeed
            )}, humidity is ${weather.humidity}%, and pressure sits at ${toUnitPressure(weather.pressure)}. ${
              weather.summaryText
            }.`;
          }
        } else {
          answer = "I'm monitoring the atmosphere! Please search a city or grant location access to receive tailored insights.";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "assistant",
            text: answer,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
        setIsAiThinking(false);
      }, 600);
    }
  }

  // Quick prompt chips
  const quickChips = [
    "Do I need an umbrella?",
    "What should I wear?",
    "Is it safe for outdoor exercise?",
    "Explain the 10-day forecast",
  ];

  // Forecast active list selection
  const forecastItems =
    activeTab === "today"
      ? weather?.todayHours ?? []
      : activeTab === "tomorrow"
      ? weather?.tomorrowHours ?? []
      : [];

  const visibleForecast = forecastExpanded ? forecastItems : forecastItems.slice(0, 6);
  const visibleDays = forecastExpanded ? weather?.tenDays ?? [] : weather?.tenDays?.slice(0, 6) ?? [];

  return (
    <div className="skycast-app">
      {/* Ambient background glows */}
      <div className="ambient-glow-top" />
      <div className="ambient-glow-bottom" />

      <div className="main-content-wrapper">
        {/* =========================================================
            TOP NAVIGATION BAR
            ========================================================= */}
        <header className="skycast-header">
          {/* Left section: Hamburger + SkyCast + Location Badge */}
          <div className="header-left">
            <button className="icon-btn-ghost" aria-label="Open Navigation Menu">
              <Menu size={20} />
            </button>

            <span
              className="brand-text"
              onClick={() => {
                // Quick reset to Khulna or current location
                searchInputRef.current?.focus();
                setSearchFocused(true);
              }}
            >
              SkyCast
            </span>

            {/* Clickable Location Badge: updates to searched city */}
            <button
              className="location-badge"
              onClick={() => {
                searchInputRef.current?.focus();
                setSearchFocused(true);
              }}
              title="Click to search any city"
              aria-label="Current city location"
            >
              <MapPin size={15} className="location-pin-icon" />
              <span className="location-badge-text">
                {weather
                  ? `${weather.place.name}${weather.place.country ? `, ${weather.place.country}` : ""}`
                  : "Khulna, Bangladesh"}
              </span>
            </button>
          </div>

          {/* Center: Search location input with Fixed Dropdown */}
          <div className="header-search" ref={searchRef}>
            <div className="search-bar-inner">
              {searchLoading ? (
                <Loader2 size={16} className="text-sky-400 animate-spin flex-shrink-0" />
              ) : (
                <Search size={16} className="text-slate-400 flex-shrink-0" />
              )}

              <input
                ref={searchInputRef}
                type="text"
                className="search-input-field"
                placeholder="Search any city (e.g. Kandy, London, Tokyo)..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchFocused(true);
                }}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
              />

              <div className="search-action-btns">
                {query.length > 0 && (
                  <button
                    type="button"
                    className="search-clear-btn"
                    onClick={() => {
                      setQuery("");
                      setSuggestions([]);
                    }}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}

                <button
                  type="button"
                  className="locate-btn"
                  onClick={handleUseLocation}
                  title="Detect my current location with GPS"
                  aria-label="Use current location"
                >
                  <LocateFixed size={16} />
                </button>
              </div>
            </div>

            {/* Search Dropdown (High Z-Index, NEVER hides behind weather cards) */}
            {searchFocused && (
              <div className="search-dropdown">
                {/* 1. If user typed a query, show autocomplete suggestions */}
                {suggestions.length > 0 ? (
                  <>
                    <div className="search-dropdown-section-title">
                      <span>Matching Locations</span>
                      <span>Press Enter ↵</span>
                    </div>

                    {suggestions.map((p, idx) => (
                      <button
                        key={`${p.lat}-${p.lon}-${idx}`}
                        className={`search-suggestion-item ${highlightedIndex === idx ? "highlighted" : ""}`}
                        onClick={() => selectPlace(p)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                      >
                        <div className="suggestion-content">
                          <MapPin size={15} className="suggestion-pin-icon" />
                          <div className="suggestion-text-group">
                            <span className="suggestion-name">{p.name}</span>
                            <span className="suggestion-sub">{p.country}</span>
                          </div>
                        </div>
                        <span className="suggestion-select-hint">Select</span>
                      </button>
                    ))}
                  </>
                ) : query.trim().length >= 2 && !searchLoading ? (
                  <div className="p-4 text-center text-sm text-slate-400">
                    No matching cities found for &quot;{query}&quot;. Press Enter to search anyway.
                  </div>
                ) : (
                  /* 2. If query is empty or 1 letter, show Popular Quick Cities */
                  <>
                    <div className="search-dropdown-section-title">
                      <span>Trending & Popular Cities</span>
                      <span>1-Click Switch</span>
                    </div>

                    <div className="quick-cities-grid">
                      {POPULAR_CITIES.map((city, idx) => (
                        <button
                          key={city.name}
                          className={`quick-city-chip ${highlightedIndex === idx ? "highlighted" : ""}`}
                          onClick={() => selectPlace(city)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                          <MapPin size={12} />
                          <span>{city.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className="search-dropdown-footer">
                  <span>Use ↑↓ to navigate</span>
                  <span>Esc to dismiss</span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Theme Toggle + Bell + Settings + Profile */}
          <div className="header-right">
            {/* Theme Toggle Button */}
            <button
              className="theme-pill-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <>
                  <Sun size={15} className="theme-icon-sun" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="theme-icon-moon" />
                  <span>Dark</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <button
              className="icon-btn-ghost"
              title="Notifications: All weather alerts normal"
              aria-label="Notifications"
              onClick={() => alert(`Active Weather Alert: Skies in ${weather?.place.name || "Khulna"} are ${weather?.condition || "Clear"}.`)}
            >
              <Bell size={18} />
            </button>

            {/* Settings Gear */}
            <button
              className="icon-btn-ghost"
              title="Settings: Units & Preferences"
              aria-label="Settings"
              onClick={() => setUnitMenuOpen(!unitMenuOpen)}
            >
              <Settings size={18} />
            </button>

            {/* User Profile Pill */}
            <div className="user-profile-badge" title="User Profile">
              <img
                src="/avatar.jpg"
                alt="Wow Rakibul"
                className="user-avatar-img"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="user-name-text">Wow Rakibul</span>
              <ChevronDown size={14} color="#8493b2" />
            </div>
          </div>
        </header>

        {/* Error notification banner if any */}
        {error && (
          <div
            style={{
              padding: "14px 20px",
              marginBottom: "16px",
              borderRadius: "12px",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        )}

        {/* =========================================================
            DASHBOARD 2-COLUMN MAIN CONTENT
            ========================================================= */}
        <div className="dashboard-layout">
          {/* -------------------------------------------------------
              LEFT COLUMN: Current Weather + 6 Metrics + Sun & Moon
              ------------------------------------------------------- */}
          <div className="dashboard-left">
            {/* 1. Main Current Weather Card */}
            <div className="current-weather-card">
              {loading && <div className="loading-progress-bar" />}

              <div className="current-card-header">
                <div className="current-label-group">
                  <span className="current-label-title">Current Weather</span>
                  <span className="current-time-text">{weather ? weather.currentTimeStr : "12:45 AM"}</span>
                </div>

                {/* Unit Selector Dropdown */}
                <div className="unit-selector-wrapper">
                  <button
                    className="unit-dropdown-btn"
                    onClick={() => setUnitMenuOpen(!unitMenuOpen)}
                    aria-label="Select temperature unit"
                  >
                    <span>{unit === "F" ? "Fahrenheit" : "Celsius"}</span>
                    <ChevronDown size={14} />
                  </button>

                  {unitMenuOpen && (
                    <div className="unit-dropdown-menu">
                      <button
                        className="unit-item-btn"
                        onClick={() => {
                          setUnit("F");
                          setUnitMenuOpen(false);
                        }}
                      >
                        Fahrenheit (°F)
                      </button>
                      <button
                        className="unit-item-btn"
                        onClick={() => {
                          setUnit("C");
                          setUnitMenuOpen(false);
                        }}
                      >
                        Celsius (°C)
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Big Temp and Condition */}
              <div className="current-temp-row">
                <div className="weather-illustration-container">
                  <WeatherIllustration
                    type={parseWeatherCode(weather?.weatherCode ?? 3).type}
                    isDay={weather?.isDay ?? true}
                    size={76}
                  />
                </div>

                <div className="current-big-temp">
                  <span>{weather ? toUnitTemp(weather.temp) : 78}</span>
                  <span className="current-temp-unit">°{unit}</span>
                </div>

                <div className="current-cond-group">
                  <span className="current-cond-title">{weather ? weather.condition : "Overcast"}</span>
                  <span className="current-feels-text">
                    Feels Like {weather ? toUnitTemp(weather.feelsLike) : 82}°
                  </span>
                </div>
              </div>

              {/* Dynamic Summary Sentence */}
              <p className="current-summary-desc">
                {weather?.summaryText || "There will be mostly overcast skies. The high will be 90°"}
              </p>
            </div>

            {/* 2. 2x3 Grid of 6 Weather Metric Cards */}
            <div className="metrics-grid-2x3">
              {/* Card 1: Air Quality */}
              <div className="metric-glass-card">
                <div className="metric-header">
                  <Wind className="metric-header-icon" />
                  <span className="metric-header-label">Air Quality</span>
                </div>
                <div className="metric-big-value">{weather ? weather.airQuality : 182}</div>
              </div>

              {/* Card 2: Wind */}
              <div className="metric-glass-card">
                <div className="metric-header">
                  <Wind className="metric-header-icon" />
                  <span className="metric-header-label">Wind</span>
                </div>
                <div className="metric-big-value">{weather ? toUnitWind(weather.windSpeed) : "6 mph"}</div>
              </div>

              {/* Card 3: Humidity */}
              <div className="metric-glass-card">
                <div className="metric-header">
                  <Droplets className="metric-header-icon" />
                  <span className="metric-header-label">Humidity</span>
                </div>
                <div className="metric-big-value">{weather ? `${weather.humidity}%` : "73%"}</div>
              </div>

              {/* Card 4: Visibility */}
              <div className="metric-glass-card">
                <div className="metric-header">
                  <Eye className="metric-header-icon" />
                  <span className="metric-header-label">Visibility</span>
                </div>
                <div className="metric-big-value">{weather ? toUnitVisibility(weather.visibility) : "5.1 mi"}</div>
              </div>

              {/* Card 5: Pressure */}
              <div className="metric-glass-card">
                <div className="metric-header">
                  <Gauge className="metric-header-icon" />
                  <span className="metric-header-label">Pressure</span>
                </div>
                <div className="metric-big-value">{weather ? toUnitPressure(weather.pressure) : "29.88 in"}</div>
              </div>

              {/* Card 6: Dew Point (Accurately calculates dew point instead of duplicate Pressure) */}
              <div className="metric-glass-card">
                <div className="metric-header">
                  <Thermometer className="metric-header-icon" />
                  <span className="metric-header-label">Dew Point</span>
                </div>
                <div className="metric-big-value">
                  {weather ? `${Math.round(toUnitTemp(calcDewPointC(weather.temp, weather.humidity)))}°` : "74°"}
                </div>
              </div>
            </div>

            {/* 3. Sun & Moon Summary Card */}
            <div className="sun-moon-card">
              <h3 className="sun-moon-title">Sun & Moon Summary</h3>

              <div className="sun-moon-body">
                {/* Left indicators */}
                <div className="sun-moon-left-stats">
                  <div className="stat-item-row">
                    <div className="stat-icon-wrap">
                      <Sun size={18} color="#facc15" />
                    </div>
                    <div className="stat-info-text">
                      <span className="stat-sublabel">Air Quality</span>
                      <span className="stat-num-val">{weather ? weather.airQuality : 182}</span>
                    </div>
                  </div>

                  <div className="stat-item-row">
                    <div className="stat-icon-wrap">
                      <Moon size={18} color="#38bdf8" />
                    </div>
                    <div className="stat-info-text">
                      <span className="stat-sublabel">Air Quality</span>
                      <span className="stat-num-val">{weather ? weather.airQuality : 182}</span>
                    </div>
                  </div>
                </div>

                {/* Right Dual Arcs */}
                <SunMoonDualArcs
                  sunriseStr={weather ? weather.sunrise : "6:00 AM"}
                  sunsetStr={weather ? weather.sunset : "5:33 PM"}
                  currentTime={weather?.currentTimeStr}
                  theme={theme}
                />
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------
              RIGHT COLUMN: Forecast Card
              ------------------------------------------------------- */}
          <div className="forecast-side-card">
            {/* Header: Tabs + "See Monthly Cast" button */}
            <div className="forecast-card-header">
              <div className="forecast-tabs">
                <button
                  className={`forecast-tab-btn ${activeTab === "today" ? "active" : ""}`}
                  onClick={() => setActiveTab("today")}
                >
                  Today
                </button>
                <button
                  className={`forecast-tab-btn ${activeTab === "tomorrow" ? "active" : ""}`}
                  onClick={() => setActiveTab("tomorrow")}
                >
                  Tomorrow
                </button>
                <button
                  className={`forecast-tab-btn ${activeTab === "10days" ? "active" : ""}`}
                  onClick={() => setActiveTab("10days")}
                >
                  10 Days
                </button>
              </div>

              <button className="monthly-cast-btn" onClick={() => setMonthlyModalOpen(true)}>
                See Monthly Cast
              </button>
            </div>

            {/* List of Forecast items */}
            <div className="forecast-list">
              {activeTab === "10days"
                ? // 10 Days Daily Forecast View
                  visibleDays.map((item, idx) => (
                    <div className="forecast-row-item" key={item.date || idx}>
                      <div className="forecast-item-left">
                        <div className="forecast-row-icon">
                          <WeatherIllustration type={parseWeatherCode(item.weatherCode).type} size={46} />
                        </div>
                        <div className="forecast-time-info">
                          <span className="forecast-time-title">{item.dayLabel}</span>
                          <span className="forecast-cond-subtitle">{item.condition}</span>
                        </div>
                      </div>

                      <div className="forecast-item-right">
                        <div className="forecast-row-temp">
                          <span>{toUnitTemp(item.maxTemp)}</span>
                          <span className="forecast-temp-unit-small">°{unit}</span>
                        </div>

                        <div className="forecast-row-specs">
                          <span className="forecast-spec-line">Wind: {toUnitWind(item.windSpeed)}</span>
                          <span className="forecast-spec-line">Rain: {item.rainProb}%</span>
                        </div>
                      </div>
                    </div>
                  ))
                : // Today or Tomorrow Hourly Forecast View
                  visibleForecast.map((item, idx) => (
                    <div className="forecast-row-item" key={item.time || idx}>
                      <div className="forecast-item-left">
                        <div className="forecast-row-icon">
                          <WeatherIllustration type={parseWeatherCode(item.weatherCode).type} size={46} />
                        </div>
                        <div className="forecast-time-info">
                          <span className="forecast-time-title">{item.hourLabel}</span>
                          <span className="forecast-cond-subtitle">{item.condition}</span>
                        </div>
                      </div>

                      <div className="forecast-item-right">
                        <div className="forecast-row-temp">
                          <span>{toUnitTemp(item.temp)}</span>
                          <span className="forecast-temp-unit-small">°{unit}</span>
                        </div>

                        <div className="forecast-row-specs">
                          <span className="forecast-spec-line">Wind: {toUnitWind(item.windSpeed)}</span>
                          <span className="forecast-spec-line">Humidity: {item.humidity}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {/* Chevron toggle to expand/collapse forecast */}
            <div className="forecast-expand-bar">
              <button
                className="forecast-chevron-btn"
                onClick={() => setForecastExpanded(!forecastExpanded)}
                title={forecastExpanded ? "Show fewer items" : "Show more items"}
                aria-label="Toggle forecast list expansion"
              >
                {forecastExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MONTHLY CAST EXPANDED MODAL
          ========================================================= */}
      <MonthlyCastModal
        isOpen={monthlyModalOpen}
        onClose={() => setMonthlyModalOpen(false)}
        weather={weather}
        unit={unit}
        toUnitTemp={toUnitTemp}
      />

      {/* =========================================================
          AI CHAT BAR & EXPANDABLE DRAWER
          ========================================================= */}
      {chatOpen && (
        <div className="ai-drawer-container">
          <div className="ai-drawer-header">
            <div className="ai-drawer-title-group">
              <Sparkles size={18} color="#0077ff" />
              <span className="ai-drawer-title">SkyCast AI Assistant</span>
              <div className="ai-status-indicator">
                <span className="ai-status-dot" />
                <span>Live Weather Intelligence</span>
              </div>
            </div>

            <button className="icon-btn-ghost" onClick={() => setChatOpen(false)} aria-label="Close Chat">
              <X size={18} />
            </button>
          </div>

          {/* Chat message history scroll */}
          <div className="ai-messages-scroll">
            {messages.map((m) => (
              <div key={m.id} className={`chat-bubble ${m.sender}`}>
                <div className={`chat-avatar ${m.sender === "user" ? "user-av" : "ai-av"}`}>
                  {m.sender === "user" ? <UserIcon size={16} /> : <Bot size={16} />}
                </div>
                <div className="chat-content">
                  <p>{m.text}</p>
                </div>
              </div>
            ))}

            {isAiThinking && (
              <div className="chat-bubble assistant">
                <div className="chat-avatar ai-av">
                  <Bot size={16} />
                </div>
                <div className="chat-content">
                  <div className="thinking-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="ai-suggestions-row">
            {quickChips.map((chip, idx) => (
              <button key={idx} className="suggestion-chip" onClick={() => handleSendAiQuestion(chip)}>
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Docked AI Chat Bar */}
      <div className="ai-dock-bar-wrapper">
        <form
          className="ai-dock-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendAiQuestion();
          }}
        >
          <div
            className="ai-badge-pill"
            onClick={() => setChatOpen(!chatOpen)}
            style={{ cursor: "pointer" }}
            title="Toggle AI conversation"
          >
            <Sparkles size={14} />
            <span>SkyCast AI</span>
          </div>

          <input
            type="text"
            className="ai-dock-input"
            placeholder='Ask AI about the weather, travel advice, clothing, or rain (e.g. "Will it rain today?")...'
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onFocus={() => setChatOpen(true)}
          />

          <div className="ai-dock-actions">
            <button
              type="button"
              className="icon-btn-ghost"
              onClick={() => setChatOpen(!chatOpen)}
              title={chatOpen ? "Minimize Chat" : "Expand Chat"}
            >
              <MessageSquare size={17} />
            </button>

            <button
              type="submit"
              className="ai-send-btn"
              disabled={!chatInput.trim() || isAiThinking}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
