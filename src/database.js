import mysql from 'mysql2';

const PORT = process.env.PORT || 3000;

export const cnn = mysql.createPool({
    host: 'localhost',
    port: PORT,
    database: 'SystemReserveHotels',
    user: 'root',
    password: 'root',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

