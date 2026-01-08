import express from 'express';
import cors from 'cors';
import { initRoutes } from './routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize WhatsApp Client
import { initClient } from './client.js';
initClient();

// Health check endpoint for uptime monitors
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Parse JSON bodies (as sent by API clients)
initRoutes(app);

// Keep-Alive Mechanism for hosting platforms (e.g., Render)
// Pings the health endpoint every 10 minutes to prevent sleep
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes
setInterval(async () => {
    try {
        const healthUrl = `http://localhost:${PORT}/health`;
        const response = await fetch(healthUrl);
        if (response.ok) {
            console.log(`[KeepAlive] Self-ping successful at ${new Date().toISOString()}`);
        } else {
            console.warn(`[KeepAlive] Self-ping failed with status: ${response.status}`);
        }
    } catch (error) {
        console.error(`[KeepAlive] Self-ping error: ${error.message}`);
    }
}, PING_INTERVAL);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
