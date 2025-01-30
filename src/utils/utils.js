import { readFile, readdir } from 'fs/promises';
export const messageErrorZod = (zodMessage)=>{
    return zodMessage.error.issues.map(el=> {
        return el.message;
    }).join(' - ');
}

export const migrationDatabase = async (pathMigration, connection)=>{
    const files = await readdir(pathMigration);
    if(files.length === 0) throw new Error('0 archives for migration database');
    for(const file of files){
        let fileContent = await readFile(pathMigration+file, 'utf-8');
        const instructions = fileContent.split(';').filter(el=> el.trim() !== '');
        for(const instruction of instructions){
            try{
                await connection.query(instruction);
            }catch(err){
                throw new Error(`Error: ${err.message}`)
            }
        }
        console.info(`Migration of ${pathMigration+file} completed`);
    }
};