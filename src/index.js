import express from 'express';
import { migrationDatabase } from './utils/utils.js';
import { userRouter } from './routes/userRoute.js';
import { rolRoute } from './routes/rolRoute.js';
import { cnn } from './database.js';

const PORT = process.env.PORT || 3000;
const app = express();


app.use(express.json());
app.use('/User', userRouter);
app.use('/Rol', rolRoute);

app.listen(PORT, async ()=>{
    console.info(`System Reserve Hotels running on port: ${PORT}`);
    console.info('Executing migrations')
    let connection;
    try{
        connection = await cnn.getConnection();
        await migrationDatabase('migrations/', connection);
    }catch(e){
        console.error('Error executing migrations:', e.message);
    }finally{
        if(connection) connection.release();
        console.info('Migrations executed successfully');
    }
});