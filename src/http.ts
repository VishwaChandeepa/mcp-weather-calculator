
import { createServer as createHttpServer } from 'node:http';

import { handleRequest } from './httpHandler.js';
import { config } from './config.js';

const httpServer = createHttpServer(
    async (req, res) => {
        await handleRequest(req, res);
    }
);

httpServer.listen(
    config.server.port,
    () => {
        console.error(
            `MCP HTTP server running on http://localhost:${config.server.port}/mcp`
        );

        console.error(
            `Weather API running on http://localhost:${config.server.port}/api/weather`
        );

        console.error(
            `Forecast API running on http://localhost:${config.server.port}/api/forecast`
        );

        console.error(
            `Intelligence API running on http://localhost:${config.server.port}/api/intelligence`
        );

        console.error(
            `AI API running on http://localhost:${config.server.port}/api/ai`
        );
    }
);

