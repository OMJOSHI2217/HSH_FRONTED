import { addBirthday, listBirthdays, connectWhatsApp, getWhatsAppStatus, sendWhatsAppMessage, disconnectWhatsApp } from './controllers.js';

export const initRoutes = (app) => {



    app.post('/api/birthday/add', addBirthday);
    app.get('/api/birthday/list', listBirthdays);

    // WhatsApp Routes
    app.get('/api/whatsapp/connect', connectWhatsApp);
    app.post('/api/whatsapp/disconnect', disconnectWhatsApp);
    app.get('/api/whatsapp/status', getWhatsAppStatus);
    app.post('/api/whatsapp/send', sendWhatsAppMessage);
};
