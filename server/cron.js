import cron from 'node-cron';
import { db } from './db.js';
import { getClient, getStatus } from './client.js';

export const initCron = () => {
    // Schedule task to run every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('Running daily birthday check...');

        if (!getStatus().connected) {
            console.log('WhatsApp not connected, skipping birthday messages.');
            return;
        }

        try {
            const data = await db.getData("/birthdays");
            const birthdays = Object.values(data);
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const todayString = `${day}-${month}`;

            const client = getClient();

            for (const contact of birthdays) {
                // Assuming dob format is YYYY-MM-DD or DD-MM encoded in the string.
                // The frontend 'addBirthday' might send YYYY-MM-DD.
                // We'll try to match MM-DD.

                let contactDob = "";
                if (contact.dob) {
                    // Handle YYYY-MM-DD (standard) -> extract MM-DD (parts 1 and 2) or DD-MM?
                    // Let's assume the stored format is what we want.
                    // If original code was `substring(0, 5)`, it assumed DD-MM...
                    // But html input type="date" gives YYYY-MM-DD. 
                    // Let's look at `server/controllers.js` logic in original: `contact.dob.substring(0, 5)`
                    // This implies DD-MM-YYYY or DD-MM.
                    // BUT our project uses YYYY-MM-DD usually.
                    // I will handle YYYY-MM-DD specially.

                    const parts = contact.dob.split('-');
                    if (parts.length === 3) {
                        // YYYY-MM-DD -> match on MM-DD (parts[1]-parts[2]) ? No, parts[2] is day, parts[1] is month.
                        // But wait, split('-') on 2000-01-30 -> ['2000', '01', '30']
                        contactDob = `${parts[2]}-${parts[1]}`; // DD-MM
                        // Wait, todayString is DD-MM.
                        // Correct.
                    } else {
                        // Fallback or exact match
                        contactDob = contact.dob;
                    }
                }

                if (contactDob === todayString) {
                    console.log(`It's ${contact.name}'s birthday! Sending message...`);
                    const cleanNumber = contact.phone.replace(/\D/g, '');
                    const chatId = `${cleanNumber}@c.us`;
                    const message = `Happy Birthday ${contact.name}! 🎂🎉`;

                    try {
                        await client.sendMessage(chatId, message);
                        console.log(`Birthday message sent to ${contact.name}`);
                    } catch (error) {
                        console.error(`Failed to send birthday message to ${contact.name}`, error);
                    }
                }
            }
        } catch (error) {
            if (error.id !== undefined) {
                console.log("No birthdays found or database empty.");
            } else {
                console.error('Error in birthday cron job:', error);
            }
        }
    });
};
