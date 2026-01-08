import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import QRCode from 'qrcode';

let client;
let qrCodeData = null;
let connectionStatus = 'disconnected'; // disconnected, connected, qr

export const initClient = () => {
    console.log('Initializing WhatsApp Client...');

    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--disable-gpu'
            ],
        }
    });

    client.on('qr', async (qr) => {
        console.log('QR RECEIVED', qr);
        try {
            qrCodeData = await QRCode.toDataURL(qr);
            connectionStatus = 'qr';
        } catch (err) {
            console.error('Failed to generate QR code data URL', err);
        }
    });

    client.on('ready', () => {
        console.log('WhatsApp Client is ready!');
        connectionStatus = 'connected';
        qrCodeData = null;
    });

    client.on('authenticated', () => {
        console.log('WhatsApp Client Authenticated');
        connectionStatus = 'connected';
    });

    client.on('auth_failure', msg => {
        console.error('AUTHENTICATION FAILURE', msg);
        connectionStatus = 'disconnected';
    });

    client.on('disconnected', (reason) => {
        console.log('Client was disconnected', reason);
        connectionStatus = 'disconnected';
    });

    try {
        client.initialize().catch(err => {
            console.error('Client initialization failed asynchronously:', err);
            // Attempt to restart or just log
        });
    } catch (err) {
        console.error('Client initialization failed synchronously:', err);
    }
};

export const disconnectClient = async () => {
    if (client) {
        try {
            await client.logout();
            console.log("Client logged out.");
        } catch (e) {
            console.error("Error logging out:", e);
        }

        try {
            await client.destroy();
            console.log("Client destroyed.");
        } catch (e) {
            console.error("Error destroying client:", e);
        }

        connectionStatus = 'disconnected';
        qrCodeData = null;

        // re-init to get new QR
        initClient();
    }
};

export const getClient = () => client;
export const getStatus = () => ({ status: connectionStatus, qrCode: qrCodeData });
