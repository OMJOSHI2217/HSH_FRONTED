import { db } from './db.js';

export const addBirthday = async (req, res) => {
    const { name, phone, dob } = req.body;
    if (!name || !phone || !dob) {
        return res.status(400).json({ status: 'error', message: 'Missing fields' });
    }

    const id = `contact_${Date.now()}`;

    try {
        await db.push(`/birthdays/${id}`, { id, name, phone, dob });
        res.json({ status: 'saved', id });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const listBirthdays = async (req, res) => {
    try {
        const data = await db.getData("/birthdays");
        res.json({ contacts: Object.values(data) });
    } catch (error) {
        res.json({ contacts: [] });
    }
};

// --- WhatsApp Controllers ---
import { getClient, getStatus, disconnectClient } from './client.js';

export const connectWhatsApp = (req, res) => {
    // Client is initialized at server start, this just checks status
    // In a more complex setup, this could trigger initialization if not running
    res.json(getStatus());
};

export const disconnectWhatsApp = async (req, res) => {
    try {
        await disconnectClient();
        res.json({ status: 'disconnected', message: 'WhatsApp client disconnected and resetting...' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to disconnect' });
    }
};

export const getWhatsAppStatus = (req, res) => {
    res.json(getStatus());
};

export const sendWhatsAppMessage = async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ status: 'error', message: 'Missing "to" or "message" fields' });
    }

    const client = getClient();
    const status = getStatus();

    if (status.status !== 'connected' || !client) {
        return res.status(503).json({ status: 'error', message: 'WhatsApp client not connected' });
    }

    try {
        // Format number: remove non-digits, append suffix
        let number = to.replace(/[^0-9]/g, '');
        if (!number.endsWith('@c.us')) {
            number = `${number}@c.us`;
        }

        // Basic India format check (optional)
        if (number.length === 15 && number.startsWith('91')) { // 91 + 10 digits + @c.us = 17 chars ?? wait
            // Just trusting the number for now
        }

        await client.sendMessage(number, message);
        res.json({ status: 'success', message: 'Message sent' });
    } catch (error) {
        console.error('Send Error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to send message: ' + error.message });
    }
};
