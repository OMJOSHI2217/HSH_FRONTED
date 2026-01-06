import { JsonDB, Config } from 'node-json-db';

export const db = new JsonDB(new Config("database", true, false, '/'));
