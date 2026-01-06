import express from 'express';
import cors from 'cors';
import { initClient } from './client.js';
import { initRoutes } from './routes.js';
import { initCron } from './cron.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize WhatsApp Client
initClient();

// Initialize Routes
initRoutes(app);

// Initialize Cron Jobs
initCron();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
