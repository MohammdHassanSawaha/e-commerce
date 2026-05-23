import "dotenv/config";
import db from "../db.js";
import catchAsync from './../utils/catchAsync.js'
import appError from './../utils/appError.js';
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { promisify } from "util";
import { rateLimit } from 'express-rate-limit'


const { prisma } = db;

const signToken = (user) =>
    jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

const createSendToken = (user, statusCode, res, payload) =>
{
    const token = signToken(user);
    res.cookie("jwt", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000
    });
    res.status(statusCode).json(payload);
};


export const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10-minute window
    max: 10, // Start blocking after 10 failed attempts
    message: 'Too many failed login attempts. Please try again after 10 minutes.',
});


// signup
export const signup = catchAsync(async (req, res, next) =>
{
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword)
        return next(new appError('name email password confirmPassword must exist', 400));
    if (password !== confirmPassword)
        return next(new appError('password and confirmPassword not equal'), 400);
    const exist = await prisma.user.findUnique(
        {
            where:
            {
                email: email,
            },
        }
    );
    if (exist)
        return next(new appError('user already exist with this email', 409));
    if (password.length < 7)
        return next(new appError('password is too short', 400));
    const hashedPassword = await bcryptjs.hash(password, 16);
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password_hash: hashedPassword,
        },
    });
    createSendToken(newUser, 201, res, {
        message: "Signup successful",
        user: { id: newUser.id, email: newUser.email }
    });
});



// login 
export const login = catchAsync(async (req, res, next) =>
{
    const { email, password } = req.body;
    if (!email || !password)
    {
        req.rateLimit.increment();
        return next(new appError(`email and password must exists`), 404);
    }
    const find = await prisma.user.findUnique(
        {
            where:
            {
                email: email,
            },
        }
    )
    if (!find)
    {
        req.rateLimit.increment();
        return next(new appError(`No user found with this email`), 404);
    }
    const isMatch = await bcryptjs.compare(password, find.password_hash);
    if (!isMatch)
    {
        req.rateLimit.increment();
        return res.status(400).json({ message: "Invalid credentials" });
    }

    req.rateLimit.reset();

    createSendToken(find, 200, res, { message: "Login successful" });
});


// logout
export const logout = (req, res) =>
{
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
}


// update password
export const updatePassword = catchAsync(async (req, res, next) =>
{
    const { passwordCurrent, password, confirmPassword } = req.body;
    if (!passwordCurrent || !password || !confirmPassword)
    {
        return next(new appError('passwordCurrent password confirmPassword must exist', 400));
    }
    if (password !== confirmPassword)
        return next(new appError('password and confirmPassword not equal', 400));
    if (password.length < 7)
        return next(new appError('password is too short', 400));

    const user = await prisma.user.findUnique({
        where: { id: req.user.id }
    });
    if (!user)
        return next(new appError('User not found', 404));

    const isMatch = await bcryptjs.compare(passwordCurrent, user.password_hash);
    if (!isMatch)
    {
        return next(new appError('Your current password is wrong.', 401));
    }

    const hashedPassword = await bcryptjs.hash(password, 16);
    const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
            password_hash: hashedPassword,
            passwordChangedAt: new Date()
        }
    });

    createSendToken(updatedUser, 200, res, { message: 'Password updated successfully' });
});



// restrictTo 
export const restrictToAdmin = (req, res, next) =>
{
    if (req.user?.role !== 'admin')
        return res.status(403).json({ error: 'Admins only' });
    next();
};



const changedPasswordAfter = (user, JWTTimestamp) =>
{
    if (user?.passwordChangedAt)
    {
        const changedTimestamp = parseInt(
            user.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
};

// protect

export const protect = catchAsync(async (req, res, next) =>
{
    // 1) Getting token and check of it's there 
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    )
    {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt)
    {
        token = req.cookies.jwt;
    }

    if (!token)
    {
        return next(
            new appError('You are not logged in! Please log in to get access.', 401)
        );
    }

    // 2) Verification token
    // because it's  a promise (promisify)
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

    // 3) Check if user still exists
    const currentUser = await prisma.user.findUnique({
        where: {
            id: decoded.id,
        },
    });
    if (!currentUser)
    {
        return next(
            new appError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }

    // 4) Check if user changed password after the token was issued
    if (changedPasswordAfter(currentUser, decoded.iat))
    {
        return next(
            new appError('User recently changed password! Please log in again.', 401)
        );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});