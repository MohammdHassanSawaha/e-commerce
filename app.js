import express from 'express';
import cookieParser from "cookie-parser";
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { xss } from 'express-xss-sanitizer';
import userRouter from './routes/userRoutes.js';
import categoryRouter from './routes/categoryRoutes.js';
import productRouter from './routes/productRoutes.js';
import orderRouter from './routes/orderRoutes.js';


const app = express();

const limiter = rateLimit({
	max: 1000,
	windowMs: 60 * 60 * 1000,
	message: 'too many requests from this ip please try again in one hour'
})

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(limiter);
app.use(xss())

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


// app.all('*', (req, res, next) =>
// {
// 	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });


export default app;