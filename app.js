import express from 'express';

import userRouter from './routes/userRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import productRouter from './routes/productRoutes.js';


const app = express();

app.use(express.json());


const PORT = process.env.PORT || 3000;


// routes
app.use('/users', userRouter);
app.use('/categories', categoryRouter);
app.use('/products', productRouter);



// starting server
app.listen(PORT, () => { console.log(`server is running on port ${PORT}`) });
