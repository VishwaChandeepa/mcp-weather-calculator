# MCP Weather Calculator 🌤️

A TypeScript-based **Model Context Protocol (MCP) server** that provides calculation and real-time weather tools through the MCP standard.

This project was built to learn and demonstrate how an MCP server can expose **tools, resources, and prompts** that can be used by MCP-compatible clients.

## 🚀 Features

The server currently provides:

* ➕ Add two numbers
* ✖️ Multiply two numbers
* 🌤️ Get current weather information for a city
* 📄 Server information resource
* 📝 Weather report prompt
* 🔍 MCP Inspector support for testing

## 🛠️ Available MCP Tools

### 1. `add`

Adds two numbers together.

**Input:**

```text
a: number
b: number
```

**Example:**

```text
10 + 20
```

**Result:**

```text
The result is 30
```

---

### 2. `multiply`

Multiplies two numbers together.

**Input:**

```text
a: number
b: number
```

**Example:**

```text
10 × 20
```

**Result:**

```text
The result is 200
```

---

### 3. `get_weather`

Retrieves current weather information for a specified city using the wttr.in weather service.

**Input:**

```text
city: string
```

**Weather information includes:**

* Temperature
* Feels like temperature
* Weather condition
* Humidity
* Wind speed
* Visibility
* Atmospheric pressure

**Example:**

```text
Ginigathena
```

**Example result:**

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

## 📚 MCP Resource

The server provides a resource:

```text
info://calculator
```

The resource provides information about:

* Available MCP tools
* Weather information supported by the server

## 📝 MCP Prompt

The server provides a prompt called:

```text
weather_report
```

The prompt accepts a city name and creates instructions for generating a clear and detailed weather report.

It requests:

* City name
* Temperature
* Feels like temperature
* Weather condition
* Humidity
* Wind speed
* Visibility
* Atmospheric pressure

## 🏗️ Project Structure

```text
mcp-weather-calculator/
│
├── src/
│   └── index.ts
│
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

## 💻 Technologies Used

* **TypeScript**
* **Node.js**
* **MCP TypeScript SDK**
* **Zod**
* **Axios**
* **tsx**
* **wttr.in**
* **MCP Inspector**

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/VishwaChandeepa/mcp-weather-calculator.git
```

Go into the project:

```bash
cd mcp-weather-calculator
```

Install dependencies:

```bash
npm install
```

## ▶️ Run the MCP Server

Start the server with:

```bash
npx tsx src/index.ts
```

You should see:

```text
My Weather Calculator MCP server is running
```

## 🔍 Test with MCP Inspector

Run:

```bash
npx @modelcontextprotocol/inspector npx tsx src/index.ts
```

MCP Inspector will start locally and open in your browser.

You can use it to test:

* Tools
* Resources
* Prompts

### Example Tool Test

Select:

```text
get_weather
```

Provide:

```text
Ginigathena
```

The server will return the current weather information.

## 🧪 TypeScript Validation

The project includes a TypeScript configuration file.

To check the project for TypeScript errors:

```bash
npx tsc --noEmit
```

## 🔐 Environment & Security

The project does not store API keys or secrets in the repository.

The `.gitignore` file excludes:

```text
node_modules/
.env
.env.*
dist/
```

## 🎯 Learning Objectives

This project demonstrates the basic structure of an MCP server and how MCP can expose different capabilities through:

* **Tools** — perform actions or calculations
* **Resources** — provide information
* **Prompts** — provide reusable prompt templates

It also demonstrates how TypeScript, external APIs, schema validation, and MCP can work together in a single project.

## 📌 Future Improvements

Possible future improvements include:

* 🌦️ Weather forecast tool
* 🌍 More detailed location support
* ⚠️ Improved error handling and validation
* 📊 Weather comparison between cities
* 🌡️ Temperature unit selection
* 🧪 Automated tests
* 🔄 Additional MCP tools

## 👨‍💻 Author

**Vishwa Chandeepa Senarathna**

GitHub: `VishwaChandeepa`

---

⭐ If you find this project useful for learning MCP, feel free to explore the repository and experiment with the tools.
