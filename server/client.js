import pkg from 'whatsapp-web.js';
import fs from 'fs';
const { Client, LocalAuth } = pkg;
// import qrcodeTerminal from 'qrcode-terminal'; // Optional for terminal output

let qrCodeData = null;
let isConnected = false;
let clientInfo = null;

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }), // Explicit path
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR Code received. Waiting for scan...');
    // qrcodeTerminal.generate(qr, { small: true }); // Uncomment for terminal QR
    qrCodeData = qr; // Store raw QR string for frontend to render
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    isConnected = true;
    clientInfo = client.info;
    qrCodeData = null;
});

client.on('authenticated', () => {
    console.log('WhatsApp Authenticated');
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
    isConnected = false;
});

client.on('disconnected', (reason) => {
    console.log('WhatsApp Client disconnected:', reason);
    isConnected = false;
    clientInfo = null;
});

export const initClient = () => {
    console.log('Initializing WhatsApp Client...');
    client.initialize().catch(err => {
        console.error("Failed to initialize client:", err);
    });
};

export const getQrCode = () => qrCodeData;

export const getStatus = () => {
    if (isConnected && clientInfo) {
        return {
            connected: true,
            phone: clientInfo.wid.user,
            userName: clientInfo.pushname
        };
    }
    return { connected: false };
};

export const getClient = () => client;

// ... (existing code)

export const restartClient = async () => {
    console.log('Restarting WhatsApp Client...');
    isConnected = false;
    qrCodeData = null;
    clientInfo = null;
    try {
        await client.destroy();
    } catch (e) {
        console.error("Error destroying client:", e);
    }

    // Hard Reset: Delete session data
    try {
        console.log("Clearing session data...");
        if (fs.existsSync('./.wwebjs_auth')) {
            fs.rmSync('./.wwebjs_auth', { recursive: true, force: true });
        }
    } catch (e) {
        console.error("Error clearing session data:", e);
    }

    // Re-initialize
    initClient();
};
