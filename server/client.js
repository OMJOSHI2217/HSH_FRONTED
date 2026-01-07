import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

let client;
let qrCodeData = null;
let connectionStatus = 'disconnected'; // disconnected, connected, qr

export const initClient = () => {
    console.log('Initializing WhatsApp Client...');

    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
    });

    client.on('qr', (qr) => {
        console.log('QR RECEIVED', qr);
        qrCodeData = qr; // Store QR for frontend
        connectionStatus = 'qr';
        // qrcode.generate(qr, { small: true }); // Optional: Log to terminal
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
        // Re-initialize logic could go here
    });

    client.initialize();
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
