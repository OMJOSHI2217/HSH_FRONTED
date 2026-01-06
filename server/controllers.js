import { getQrCode, getStatus, getClient, restartClient } from './client.js';
import { db } from './db.js';

export const connect = (req, res) => {
    const qr = getQrCode();
    const statusInfo = getStatus();

    if (qr) {
        res.json({
            status: 'qr',
            qrCode: qr,
            message: 'Scan this QR to connect your WhatsApp'
        });
    } else if (statusInfo.connected) {
        res.json({
            status: 'connected',
            message: 'Already connected',
            user: statusInfo
        });
    } else {
        res.json({
            status: 'loading',
            message: 'QR Code is being generated, please wait...'
        });
    }
};

export const status = (req, res) => {
    res.json(getStatus());
};

export const send = async (req, res) => {
    const { to, message } = req.body;
    const client = getClient();

    if (!getStatus().connected) {
        return res.status(400).json({ status: 'error', message: 'WhatsApp not connected' });
    }

    const sent = [];
    const failed = [];
    const recipients = Array.isArray(to) ? to : [to];

    for (const number of recipients) {
        try {
            const cleanNumber = String(number).replace(/\D/g, '');
            // append country code if missing? Assuming 91 for now if user doesn't provide?
            // Safer to rely on user providing full number or handle it in frontend.
            // Original code:
            // const cleanNumber = number.replace(/\D/g, '');

            const chatId = cleanNumber.includes('@c.us') ? cleanNumber : `${cleanNumber}@c.us`;
            await client.sendMessage(chatId, message);
            sent.push(number);
        } catch (error) {
            console.error(`Failed to send to ${number}`, error);
            failed.push(number);
        }
    }

    res.json({
        status: 'success',
        sent,
        failed
    });
};

export const verify = async (req, res) => {
    const { number } = req.body;
    const client = getClient();

    if (!getStatus().connected) {
        return res.status(400).json({ error: 'WhatsApp not connected' });
    }

    try {
        const cleanNumber = String(number).replace(/\D/g, '');
        // whatsapp-web.js expects number with country code.
        const contact = await client.getNumberId(cleanNumber);

        if (contact) {
            res.json({ registered: true, jid: contact._serialized });
        } else {
            res.json({ registered: false });
        }
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const regenerateQR = async (req, res) => {
    try {
        await restartClient();
        res.json({ status: 'restarting', message: 'Client restarting, new QR will be generated shortly.' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

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
