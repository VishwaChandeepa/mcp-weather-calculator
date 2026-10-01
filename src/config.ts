export const config = {
    server: {
        port: 3000
    },

    mcp: {
        url: 'http://localhost:3000/mcp'
    },

    gemini: {
        model: 'gemini-3.5-flash-lite'
    }
} as const;