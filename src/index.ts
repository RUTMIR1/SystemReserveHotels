import express, {Request, Response} from 'express';
import { PoolConnection } from 'mysql2/promise';
import { insertUsers, migrationDatabase } from './utils/utils.js';
import { cnn } from './database.js';
import { userRoute } from './routes/userRoute.js';
import { rolRoute } from './routes/rolRoute.js';
import { addressRoute } from './routes/addressRoute.js';
import { roomRoute } from './routes/roomRoute.js';
import { reservationRoute } from './routes/reservationRoute.js';
import { categoryRoute } from './routes/categoryRoute.js';
import cookieParser from 'cookie-parser';
import { accessCookie } from './middlewares/accessCookie.js';
import { authRoute } from './routes/authRoute.js';
import { corsMiddleware } from './middlewares/cors.js';
import { payRouter } from './routes/payRoute.js';


const PORT:number = Number(process.env.PORT) || 3000;
const app:express.Express = express();


app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());

app.use('*', accessCookie);

app.use('/auth', authRoute);
app.use('/User', userRoute);
app.use('/Rol', rolRoute);
app.use('/Address', addressRoute);
app.use('/Room', roomRoute);
app.use('/Reservation', reservationRoute);
app.use('/Category', categoryRoute);
app.use('/Pay', payRouter);

app.use('*', (req:Request, res:Response):void=>{
    res.setHeader('Content-Type', 'text/html ; charset=utf-8');
    res.status(404).send('<H1> Not Found Sorry:( </H1>');
})

app.listen(PORT, async ():Promise<void>=>{
    console.info(`System Reserve Hotels running on port: ${PORT}`);
    console.info('Executing migrations')
    let connection: PoolConnection | undefined;
    try{
        connection = await cnn.getConnection();
        await migrationDatabase('migrations/', connection);
        await insertUsers(connection);
    }catch(err:any){
        console.error('Error executing migrations:', err.message);
    }finally{
        if(connection) connection.release();
        console.info('Migrations executed successfully');
    }
});