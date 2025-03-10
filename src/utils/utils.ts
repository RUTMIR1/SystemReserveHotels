import { readFile, readdir } from 'fs/promises';
import { Connection } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { ExceptionsData } from '../types/exceptionsData.js';

export const messageErrorZod = (zodMessage: any): string => {
    return zodMessage.error.issues.map((el:{message:string}) => {
        return el.message;
    }).join(' - ');
};

export const fieldsList = (zodMessage: any): ExceptionsData[]=>{
    const fields: ExceptionsData[] = zodMessage.error.issues.map((el:{message:string, path:string[]}) => {
        const field: string = el.path[el.path.length-1];
        const message: string = el.message;
        return {field, message};
    });
    return fields;
}

export const migrationDatabase = async (pathMigration: string, connection: Connection): Promise<void> => {
    const files: string[] = await readdir(pathMigration);
    if (files.length === 0) throw new Error('0 archives for migration database');

    for (const file of files) {
        let fileContent: string = await readFile(`${pathMigration}${file}`, 'utf-8');
        const instructions: string[] = fileContent.split('#').filter(el => el.trim() !== '');

        for (const instruction of instructions) {
            try {
                await connection.query(instruction);
            } catch (err: any) {
                throw new Error(`Error: ${err.message}`);
            }
        }
        console.info(`Migration of ${pathMigration}${file} completed`);
    }
};

export const insertUsers = async (connection:Connection):Promise<void>=>{
    let pass1:string = await bcrypt.hash('admin',10);
    let pass2:string = await bcrypt.hash('12345',10);
    
    await connection.query(`INSERT INTO User (id, name, last_name, age, email, username, password, phone_number, rol_id) values
 ('431c358a-e1f4-11ef-8f63-0242ac130002' ,'John', 'Doe', 30, 'Jhon@gmail.com', 'admin', ?, '1234567','6939d182-e1e7-11ef-8f63-0242ac130002')`, [pass1]);
    await connection.query(`
        INSERT INTO User (id, name, last_name, age, email, username, password, phone_number, rol_id) values
 ('431d6c93-e1f4-11ef-8f63-0242ac130002', 'Marco', 'Hans', 25, 'Marco@gmail.com', 'tomi1', ?, '111333454', '693b0754-e1e7-11ef-8f63-0242ac130002')
        `, [pass2]);
    await connection.query(`
        INSERT INTO Address (country, province, city, house_number, floor, user_id) VALUES
    ('USA', 'New York', 'Manhattan', 123, 1, '431c358a-e1f4-11ef-8f63-0242ac130002'),
    ('Canada', 'Ontario', 'Toronto', 456, 2, '431d6c93-e1f4-11ef-8f63-0242ac130002');
        `);
    await connection.query(`
        INSERT INTO Reservation (id, reservation_date_start, reservation_date_end, check_in, 
check_out, code, amount, state, user_id, room_id) VALUES(
    '123e4567-e89b-12d3-a456-426655440000', '2025-01-01', '2025-03-03', '2025-02-02',
    '2025-02-08', 'CODE0001', 1000000.00, 'current', '431d6c93-e1f4-11ef-8f63-0242ac130002',
    'd4b522f1-e3a4-11ef-8f63-0242ac130002')`)
}