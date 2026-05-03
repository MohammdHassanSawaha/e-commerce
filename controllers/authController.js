import "dotenv/config";
import db from "../db.js";
import catchAsyn from './../utils/catchAsync.js'
import appError from './../utils/appError.js';
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const { prisma } = db;

export const signup = catchAsyn(async (req, res, next) =>
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
    const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.SECRET_KEY,
        { expiresIn: "1d" }
    );

    // Set cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({
        message: "Signup successful",
        user: { id: newUser.id, email: newUser.email }
    });
});
