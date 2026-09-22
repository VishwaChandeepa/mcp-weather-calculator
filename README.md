# 🌦️ MCP Weather & Calculator Server

> A modular **Model Context Protocol (MCP)** server that combines mathematical utilities with real-time weather intelligence.

[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-2.0-purple)](https://modelcontextprotocol.io/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Overview

**MCP Weather & Calculator Server** is a modular TypeScript implementation of the **Model Context Protocol (MCP)**.

The project demonstrates how an AI application can interact with external capabilities through structured **Tools, Resources, and Prompts**.

Instead of putting everything into one large file, the server is organized into independent modules, making it easier to understand, maintain, test, and extend.

### 💡 What can it do?

The server can:

* ➕ Add numbers
* ✖️ Multiply numbers
* 🌡️ Retrieve real-time weather information
* 📅 Retrieve multi-day weather forecasts
* 📚 Expose server information through an MCP Resource
* 🤖 Generate structured weather-report instructions through an MCP Prompt

---

# ✨ Features

| Feature                         | Description                                  |
| ------------------------------- | -------------------------------------------- |
| ➕ **Add Tool**                  | Adds two numbers                             |
| ✖️ **Multiply Tool**            | Multiplies two numbers                       |
| 🌤️ **Weather Tool**            | Retrieves detailed current weather           |
| 📅 **Forecast Tool**            | Retrieves forecasts for up to 3 days         |
| 📚 **Server Resource**          | Provides information about the MCP server    |
| 🤖 **Weather Prompt**           | Generates a structured weather-report prompt |
| 🧩 **Modular Architecture**     | Separates tools, resources, and prompts      |
| 🔍 **MCP Inspector**            | Provides an interactive testing environment  |
| 🔒 **Input Validation**         | Uses Zod schemas for structured inputs       |
| 🌐 **External API Integration** | Uses `wttr.in` for weather data              |

---

# 🧠 Understanding the MCP Architecture

This project demonstrates the three important MCP concepts:

### 🔧 Tools

Tools are executable functions that an AI client can call.

This server provides:

```text
add
multiply
get_weather
get_forecast
```

For example:

```text
AI Client
    │
    ▼
get_weather("Ginigathena")
    │
    ▼
MCP Server
    │
    ▼
wttr.in API
    │
    ▼
Weather Data
```

---

### 📚 Resources

Resources provide information that an MCP client can read.

This project exposes:

```text
info://calculator
```

The resource contains information about:

* Available tools
* Weather capabilities
* Forecast capabilities
* Server functionality

---

### 🤖 Prompts

Prompts provide reusable instructions that can be requested by an MCP client.

This project provides:

```text
weather_report
```

Example:

```text
weather_report("Ginigathena")
```

The prompt asks the AI to create a simple weather report containing important weather information.

---

# 🛠️ Available Tools

## ➕ `add`

Adds two numbers.

### Input

```json
{
  "a": 10,
  "b": 20
}
```

### Result

```text
The result is 30
```

---

## ✖️ `multiply`

Multiplies two numbers.

### Input

```json
{
  "a": 10,
  "b": 5
}
```

### Result

```text
The result is 50
```

---

## 🌤️ `get_weather`

Retrieves detailed current weather information for a city.

### Input

```json
{
  "city": "Ginigathena"
}
```

### Returned information

* 🌡️ Temperature
* 🤒 Feels-like temperature
* ☁️ Weather condition
* 💧 Humidity
* 💨 Wind speed
* 👁️ Visibility
* 🌡️ Atmospheric pressure

### Example

```text
Weather in Ginigathena:

Temperature: 17°C
Feels like: 17°C
Condition: Cloudy
Humidity: 94%
Wind Speed: 11 km/h
Visibility: 10 km
Pressure: 1015 mb
```

---

## 📅 `get_forecast`

Retrieves a multi-day weather forecast.

### Input

```json
{
  "city": "Ginigathena",
  "days": 3
}
```

The `days` parameter supports:

```text
1 → 3 days
```

### Returned information

* Forecast date
* Minimum temperature
* Maximum temperature
* Average temperature

---

# 🔄 Request Flow

The overall system works like this:

```text
                 ┌─────────────────────┐
                 │      MCP Client     │
                 │  Claude / Inspector │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │     MCP Server      │
                 │     TypeScript      │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
     ┌──────────┐      ┌──────────┐      ┌──────────┐
     │  Tools   │      │Resources │      │ Prompts  │
     └────┬─────┘      └──────────┘      └──────────┘
          │
     ┌────┴─────────────┐
     │                  │
     ▼                  ▼
 Calculator         Weather API
     │                  │
     │                  ▼
     │              wttr.in
     │
     ▼
  Results
```

---

# 📂 Project Structure

```text
mcp-weather-calculator/
│
├── 📁 src/
│   │
│   ├── 📁 tools/
│   │   ├── calculator.ts
│   │   ├── weather.ts
│   │   └── forecast.ts
│   │
│   ├── 📁 resources/
│   │   └── serverInfo.ts
│   │
│   ├── 📁 prompts/
│   │   └── weatherReport.ts
│   │
│   └── index.ts
│
├── 📄 package.json
├── 📄 package-lock.json
├── 📄 tsconfig.json
├── 📄 .gitignore
└── 📄 README.md
```

### Why this structure?

The project follows a modular approach:

```text
Tools       → src/tools/
Resources   → src/resources/
Prompts     → src/prompts/
Server      → src/index.ts
```

This makes it easier to add new functionality without turning `index.ts` into a large file.

---

# ⚙️ Technologies

### Core

* **TypeScript**
* **Node.js**
* **Model Context Protocol**
* **Zod**

### Integration

* **Axios**
* **wttr.in API**

### Development & Testing

* **VS Code**
* **MCP Inspector**
* **Git**
* **GitHub**

---

# 📦 Installation

## 1. Clone the repository

```bash
git clone https://github.com/VishwaChandeepa/mcp-weather-calculator.git
```

```bash
cd mcp-weather-calculator
```

## 2. Install dependencies

```bash
npm install
```

## 3. Validate TypeScript

```bash
npx tsc --noEmit
```

If there are no errors, the project is ready to run.

---

# ▶️ Running the MCP Server

Start the server with:

```bash
npx tsx src/index.ts
```

The server communicates through **stdio**, so it is designed to be connected to an MCP-compatible client.

---

# 🔍 Testing with MCP Inspector

MCP Inspector provides an interactive interface for testing the server.

Run:

```bash
npx @modelcontextprotocol/inspector npx tsx src/index.ts
```

Then open the Inspector interface in your browser.

You can test:

```text
Tools
 ├── add
 ├── multiply
 ├── get_weather
 └── get_forecast

Resources
 └── info://calculator

Prompts
 └── weather_report
```

---

# 🧪 Example Test

### Calculator

```text
Input:
a = 10
b = 20

Output:
The result is 30
```

### Weather

```text
Input:
city = Ginigathena

Output:
Temperature: 17°C
Condition: Cloudy
Humidity: 94%
Wind Speed: 11 km/h
```

### Forecast

```text
Input:
city = Ginigathena
days = 3

Output:
3-day weather forecast
```

---

# 🧩 Validation

This project uses **Zod** to validate incoming tool parameters.

For example, the forecast tool restricts the number of requested days:

```text
Minimum: 1 day
Maximum: 3 days
```

This prevents invalid input from being processed.

---

# 🔐 Security & Reliability

The project follows several basic security and reliability practices:

* ✅ Input validation with Zod
* ✅ URL encoding for city names
* ✅ API errors handled with `try/catch`
* ✅ Sensitive files excluded through `.gitignore`
* ✅ No API keys stored in source code
* ✅ Structured MCP tool definitions

---

# 🎯 Learning Objectives

This project was created to understand practical MCP development using TypeScript.

Key concepts explored:

```text
MCP Server
    ↓
Tools
    ↓
Resources
    ↓
Prompts
    ↓
External API Integration
    ↓
Input Validation
    ↓
Modular Architecture
    ↓
MCP Inspector Testing
```

The project also demonstrates how traditional backend functionality can be exposed as capabilities that AI applications can interact with through MCP.

---

# 🔮 Future Roadmap

The project can be extended with additional capabilities.

### Calculator

* [ ] ➖ Subtraction
* [ ] ➗ Division
* [ ] 📊 Percentage calculation
* [ ] 🌡️ Temperature conversion

### Weather

* [ ] 🌅 Sunrise / sunset
* [ ] 🌧️ Rain probability
* [ ] 🌬️ Wind direction
* [ ] 🌎 UV index
* [ ] 📍 Coordinates / geolocation
* [ ] 📆 Longer forecasts

### MCP

* [ ] More MCP Resources
* [ ] More reusable Prompts
* [ ] Advanced tool combinations
* [ ] Better API error handling
* [ ] Automated testing
* [ ] Docker support
* [ ] CI/CD with GitHub Actions

---

# 📸 Project Demo

### MCP Inspector

*Add your MCP Inspector screenshot here.*

```text
docs/
└── mcp-inspector.png
```

Then add:

```markdown
![MCP Inspector](docs/mcp-inspector.png)
```

### Architecture

*Add an architecture diagram here.*

```text
MCP Client
    ↓
MCP Server
    ↓
Tools / Resources / Prompts
    ↓
External Weather API
```

---

# 🌟 Why This Project?

This project goes beyond creating a simple weather API.

It demonstrates how an application can expose different types of capabilities through **Model Context Protocol**:

```text
             MCP
              │
      ┌───────┼───────┐
      ▼       ▼       ▼
    Tools  Resources Prompts
      │       │       │
      ▼       ▼       ▼
   Actions  Context Instructions
```

This makes the project a practical introduction to building **AI-integrated developer tools and services**.

---

# 👨‍💻 Author

**Vishwa Chandeepa**

Software Engineering Undergraduate
NSBM Green University

### Connect

* GitHub: [VishwaChandeepa](https://github.com/VishwaChandeepa)
* LinkedIn: [Vishwa Chandeepa](https://linkedin.com/in/vishwachandeepa)

---

## ⭐ Support

If you found this project useful or interesting, consider giving the repository a ⭐ on GitHub.

---

<p align="center">
  Built with TypeScript + MCP + ☁️ Weather APIs
</p>
