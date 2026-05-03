import express from 'express';

import userRouter from './routes/userRoutes.js';
import authRouter from './routes/authRoutes.js';



const app = express();
console.log("app");

app.use(express.json());


const PORT = process.env.PORT || 8080;


// routes
app.use('/users', userRouter);
app.use('/auth', authRouter);




// starting server
app.listen(PORT, () => { console.log(`server is running on port ${PORT}`) });
