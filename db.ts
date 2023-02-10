import sqlite3 from 'sqlite3';

const sqlClient = sqlite3.verbose();
const db = new sqlClient.Database(':memory:', (err) => {
    if (err) {
      return console.error(err.message);
    }
     db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS card_details (
            cardId INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            cardNumber TEXT NOT NULL,
            cardBalance INTEGER,
            cardLimit INTEGER NOT NULL
         )`);
     });
    console.log('Database connection Successful.');
});

export default db;