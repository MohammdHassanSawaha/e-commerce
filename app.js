import express from 'express';
import cookieParser from "cookie-parser";

import userRouter from './routes/userRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import productRouter from './routes/productRoutes.js';
import orderRouter from './routes/orderRoutes.js';


const app = express();

app.use(express.json());
app.use(cookieParser());


// routes
app.use('/users', userRouter);
app.use('/categories', categoryRouter);
app.use('/products', productRouter);
app.use('/orders', orderRouter);


// simple error handler for appError and Prisma errors
app.use((err, req, res, next) =>
{
	const statusCode = err.statusCode || (err.code === 'P2025' ? 404 : 500);
	const status = err.status || (statusCode >= 500 ? 'error' : 'fail');
	res.status(statusCode).json({
		status,
		message: err.message || 'Internal server error',
	});
});

export default app;