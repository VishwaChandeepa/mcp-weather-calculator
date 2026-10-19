# 🌦️ MCP Weather & AI Assistant

A TypeScript project exploring the **Model Context Protocol (MCP)** by connecting weather tools, forecasts, and an AI-powered weather assistant.

The project combines real-time weather data, weather forecasts, AI integration, and modular MCP tools to demonstrate how AI applications can interact with external services.

## ✨ Features

* 🌤️ **Current Weather** — Retrieve weather information for a city.
* 📅 **Weather Forecasts** — Get forecasts for 1–3 days.
* 🤖 **AI Weather Assistant** — Use Google Gemini to answer weather-related questions.
* 🧠 **Weather Intelligence** — Analyze weather information to support weather-related decisions.
* 🔌 **MCP Integration** — Expose tools and capabilities through the Model Context Protocol.
* 🌐 **HTTP API** — Provide HTTP endpoints for weather information and AI functionality.
* ➕ **Calculator Tools** — Include basic mathematical operations.
* ✅ **Input Validation** — Validate inputs and handle errors.
* 🧪 **Automated Testing** — Test application functionality using Vitest.

## 🛠️ Technology Stack

* **Language:** TypeScript
* **Runtime:** Node.js
* **AI Integration:** Google Gemini
* **Protocol:** Model Context Protocol (MCP)
* **Weather Data:** Open-Meteo APIs
* **HTTP Requests:** Axios
* **Validation:** Zod
* **Testing:** Vitest
* **Version Control:** Git and GitHub

## 🏗️ Architecture

The project follows a modular architecture that separates the AI assistant, MCP tools, weather intelligence, and HTTP API.

```text
                    User
                     |
                     v
             AI Weather Assistant
                     |
                     v
                Google Gemini
                     |
                     v
                  MCP Client
                     |
                     v
                  MCP Server
                     |
          +----------+----------+
          |          |          |
          v          v          v
       Current    Forecast   Intelligence
       Weather     Tools        Tools
          |          |          |
          +----------+----------+
                     |
                     v
              Open-Meteo APIs
                     |
                     v
               Weather Data
```

The AI assistant uses weather information returned by the available tools to produce weather-related responses. Validation logic helps reduce unsupported weather claims.

## 🌤️ Weather Features

### Current Weather

Retrieve information such as:

* Temperature
* Feels-like temperature
* Weather conditions
* Humidity
* Precipitation
* Wind speed and direction
* Visibility
* Atmospheric pressure

### Weather Forecast

Retrieve forecasts for up to three days, including:

* Minimum temperature
* Maximum temperature
* Average temperature
* Weather conditions
* Rain probability
* Humidity
* Wind speed

### AI Weather Assistant

The assistant connects Gemini with MCP weather tools so users can ask natural-language questions about weather conditions and forecasts.

Example questions:

* What is the current weather in Kandy?
* What will the weather be like in Colombo tomorrow?
* Is the forecast suitable for outdoor activities?

The assistant is designed to use tool results as its source of truth rather than inventing weather information.

*AI-generated responses can still contain errors, so important weather and safety decisions should be checked against reliable sources.*

## 🚀 Getting Started

### 1. Prerequisites

Install:

* Node.js and npm
* Git
* Visual Studio Code or another code editor

A Google Gemini API key is required for the AI assistant.

### 2. Clone the Repository

```bash
git clone https://github.com/VishwaChandeepa/mcp-weather-calculator.git
cd mcp-weather-calculator
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

Add the following configuration:

```env
GEMINI_API_KEY=your_gemini_api_key
MCP_URL=http://localhost:3000/mcp
PORT=3000
FRONTEND_URL=http://localhost:5173
GEMINI_MODEL=gemini-3.5-flash-lite
WEATHER_REQUEST_TIMEOUT=10000
```

Replace `your_gemini_api_key` with your own valid API key.

**Security:** Never commit your `.env` file or publish your API key on GitHub.

### 5. Build the Project

```bash
npm run build
```

### 6. Run Automated Tests

```bash
npm test
```

At the latest verified development checkpoint, all **34 automated tests passed**, and the TypeScript build completed without errors.

Run the commands yourself to verify the current version.

## ▶️ Running the Application

### Start the MCP Server

```bash
npm start
```

This starts the stdio-based MCP server for compatible MCP clients.

### Start the HTTP Server

```bash
npm run start:http
```

The HTTP server uses port `3000` by default.

Available local endpoints include:

| Endpoint            | Purpose                  |
| ------------------- | ------------------------ |
| `/mcp`              | MCP communication        |
| `/api/weather`      | Current weather API      |
| `/api/forecast`     | Forecast API             |
| `/api/intelligence` | Weather intelligence API |
| `/api/ai`           | AI assistant API         |

The complete endpoint URLs use the local server address, such as `http://localhost:3000/api/weather`.

## 🧪 Development Commands

| Command              | Description                |
| -------------------- | -------------------------- |
| `npm install`        | Install dependencies       |
| `npm start`          | Start the stdio MCP server |
| `npm run start:http` | Start the HTTP server      |
| `npm test`           | Run automated tests        |
| `npm run build`      | Compile TypeScript         |

## 📁 Project Structure

```text
mcp-weather-calculator/
├── src/
│   ├── ai/
│   │   ├── weatherAssistant.ts
│   │   └── weatherAssistant.test.ts
│   ├── api/
│   │   ├── ai.ts
│   │   ├── forecast.ts
│   │   ├── intelligence.ts
│   │   └── weather.ts
│   ├── intelligence/
│   │   └── weatherIntelligence.ts
│   ├── prompt/
│   │   └── weatherReport.ts
│   ├── resources/
│   │   └── serverInfo.ts
│   ├── tools/
│   │   ├── calculator.ts
│   │   ├── forecast.ts
│   │   ├── intelligence.ts
│   │   ├── server.ts
│   │   └── weather.ts
│   ├── config.ts
│   ├── http.ts
│   └── index.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

*Note: This is a high-level illustration of the main modules; the exact files in your local checkout may differ.*

## 🔐 Security and Reliability

The project incorporates practices such as:

* Input validation
* Error handling for external API requests
* Environment-based configuration
* Keeping API keys outside source code
* Automated tests
* Validation of weather-related AI responses

## 🛣️ Future Improvements

* Improve AI weather-response validation.
* Expand automated tests and edge-case coverage.
* Add GitHub Actions for continuous integration.
* Improve the user interface and documentation.
* Add Docker support.
* Deploy the application online.

## 👨‍💻 Author

**Vishwa Chandeepa**
Software Engineering Undergraduate
NSBM Green University

* **GitHub:** https://github.com/VishwaChandeepa
* **LinkedIn:** https://www.linkedin.com/in/vishwachandeepa/

---

If you find this project interesting, feel free to explore the repository and share your feedback.
