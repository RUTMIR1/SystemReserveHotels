import express from 'express';
import { userRouter } from './routes/userRoute.js';

const PORT = process.env.PORT || 3000;
const app = express();


app.use(express.json());
app.use('/User', userRouter);


app.listen(PORT, ()=>{
    console.info(`System Reserve Hotels running on port: ${PORT}`);
})