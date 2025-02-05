import express from 'express';
import { migrationDatabase } from './utils/utils.js';
import { userRoute } from './routes/userRoute.js';
import { rolRoute } from './routes/rolRoute.js';
import { cnn } from './database.js';
import { addressRoute } from './routes/addressRoute.js';
import { roomRoute } from './routes/roomRoute.js';

const PORT = process.env.PORT || 3000;
const app = express();


app.use(express.json());
app.use('/User', userRoute);
app.use('/Rol', rolRoute);
app.use('/Address', addressRoute);
app.use('/Room', roomRoute);

app.use('*', (req, res)=>{
    res.setHeader('Content-Type', 'text/html ; charset=utf-8');
    res.status(404).send('<H1> Not Found Sorry:( </H1>');
})

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