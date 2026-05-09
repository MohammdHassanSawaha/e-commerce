import "dotenv/config";
import db from "../db.js";
import catchAsyn from './../utils/catchAsync.js'
import appError from './../utils/appError.js';

const { prisma } = db;
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// getAllUsers 
export const getAllUsers = catchAsyn(async (req, res, next) =>
{
    const users = await prisma.user.findMany();
    res.status(200).json({
        status: 'success',
        data: users,
    });
});



// getUser
export const getUser = catchAsyn(async (req, res, next) => 
{
    const id = req.params.id;
    if (!id)
        return next(new appError('No id found', 404));
    if (!uuidRegex.test(id))
        return next(new appError('Invalid id format', 400));
    const user = await prisma.user.findUnique({
        where:
        {
            id: id
        }
    })
    if (!user)
        return next(new appError('No user found', 404));
    res.status(200).json({
        status: 'success',
        data: user,
    });
});



// updateUser
export const updateUser = catchAsyn(async (req, res, next) => 
{
    const { id } = req.params;
    const data = req.body;
    if (!id || !data)
        return next(new appError('something went wrong, correct you info', 404));
    if (!uuidRegex.test(id))
        return next(new appError('Invalid id format', 400));
    const existing = await prisma.user.findUnique({
        where: { id: id },
    });
    if (!existing)
        return next(new appError('No user found', 404));
    const user = await prisma.user.update({
        where: { id: id },
        data: data,
    });
    res.status(200).json({
        status: 'success',
        data: user,
    });
});



// deleteUser
export const deleteUser = catchAsyn(async (req, res, next) =>
{
    const { id } = req.params;
    if (!id)
        return next(new appError('provide the id', 404));
    if (!uuidRegex.test(id))
        return next(new appError('Invalid id format', 400));
    const existing = await prisma.user.findUnique({
        where: { id: id },
    });
    if (!existing)
        return next(new appError('No user found', 404));
    const deletedUser = await prisma.user.delete({
        where: {
            id: id,
        },
    });
    res.status(200).json({
        status: 'success',
        data: deletedUser,
    });
})

