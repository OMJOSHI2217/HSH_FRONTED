import { connect, status, send, verify, addBirthday, listBirthdays, regenerateQR } from './controllers.js';

export const initRoutes = (app) => {
    app.get('/api/whatsapp/connect', connect);
    app.get('/api/whatsapp/status', status);
    app.post('/api/whatsapp/send', send);
    app.post('/api/whatsapp/verify', verify);
    app.post('/api/whatsapp/regenerate', regenerateQR);


    app.post('/api/birthday/add', addBirthday);
    app.get('/api/birthday/list', listBirthdays);
};
