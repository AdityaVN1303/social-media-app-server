import express from 'express'
import dotenv from 'dotenv'

import authRoutes from './routes/authRoutes.js'
import connectDb from './db/connectDb.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth/' , authRoutes);

app.listen(PORT , ()=>{
    console.log(`App Running on Port ${PORT}`);
    connectDb();
})