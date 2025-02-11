import { readFile, readdir } from 'fs/promises';
import { Connection } from 'mysql2/promise';

export const messageErrorZod = (zodMessage: any): string => {
    return zodMessage.error.issues.map((el:{message:string}) => {
        return el.message;
    }).join(' - ');
};

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
