import { addBirthday, listBirthdays } from './controllers.js';

export const initRoutes = (app) => {



    app.post('/api/birthday/add', addBirthday);
    app.get('/api/birthday/list', listBirthdays);
};
