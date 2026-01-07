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
