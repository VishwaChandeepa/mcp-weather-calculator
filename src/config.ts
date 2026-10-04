import 'dotenv/config';

function getRequiredEnv(
    name: string,
    fallback?: string
): string {
    const value =
        process.env[name] ?? fallback;

    if (!value) {
        throw new Error(
            `Missing required environment variable: ${name}`
        );
    }

    return value;
}

export const config = {
    server: {
        port: Number(
            getRequiredEnv(
                'PORT',
                '3000'
            )
        )
    },

    mcp: {
        url: getRequiredEnv(
            'MCP_URL'
        )
    },

    gemini: {
        model: getRequiredEnv(
            'GEMINI_MODEL',
            'gemini-3.5-flash-lite'
        )
    },

    weather: {
        requestTimeout: Number(
            getRequiredEnv(
                'WEATHER_REQUEST_TIMEOUT',
                '10000'
            )
        )
    }
} as const;