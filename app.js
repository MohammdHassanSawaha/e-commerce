import express from 'express';

import userRouter from './routes/userRoutes.js';



const app = express();

app.use(express.json());


const PORT = process.env.PORT || 3000;


// routes
app.use('/users', userRouter);




// starting server
app.listen(PORT, () => { console.log(`server is running on port ${PORT}`) });
