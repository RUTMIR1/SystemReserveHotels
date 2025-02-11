import mysql, { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';

export const cnn: Pool = mysql.createPool({
    host: 'localhost',
    port: 8081,
    database: 'SystemReserveHotels',
    user: 'root',
    password: 'root',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


export const querySql = async (query: string, data: any[] = []): Promise<[RowDataPacket[], any]> => {
    let connection: PoolConnection | undefined;
    try {
        connection = await cnn.getConnection();
        return await connection.query(query, data);
    } catch (err: any) {
        throw new Error(err.message);
    } finally {
        if (connection) connection.release();
    }
};


export const queryTransactionSql = async (query: string, data: any[] = []): Promise<[RowDataPacket[], any]> => {
    let connection: PoolConnection | undefined;
    try {
        connection = await cnn.getConnection();
        await connection.beginTransaction();
        const result:[RowDataPacket[], any] = await connection.query(query, data);
        await connection.commit();
        return result;
    } catch (err: any) {
        if (connection) await connection.rollback();
        throw new Error(err.message);
    } finally {
        if (connection) connection.release();
    }
};
