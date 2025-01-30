import mysql from 'mysql2';

export const cnn = mysql.createPool({
    host: 'localhost',
    port: 8081,
    database: 'SystemReserveHotels',
    user: 'root',
    password: 'root',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

export const querySql = async (query, data=[])=>{
    let connection;
    try{
        connection = await cnn.getConnection();
        return connection.query(query, data);
    }catch(e){
        throw new Error(`Error query: ${e.message}`);
    }finally{
        if(connection) connection.release();
    }
}
export const queryTransactionSql = async (query, data=null)=>{
    let connection;
    try{
        let result;
        connection = await cnn.getConnection();
        await connection.beginTransaction();
        result = await connection.query(query, data);
        await connection.commit();
        return result;
    }catch(e){
        throw new Error(`Error query: ${e.message}`);
    }finally{
        if(connection) connection.release();
    }
}