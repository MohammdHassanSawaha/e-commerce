import "dotenv/config";
import db from "../db.js";
import catchAsyn from './../utils/catchAsync.js'
import appError from './../utils/appError.js';


const { prisma } = db;

export const getAllCategories = catchAsyn(async (req, res, next) =>
{
    const categories = await prisma.category.findMany({
        select:
        {
            name: true,
            description: true,
        }
    });
    res.status(200).json({
        status: 'success',
        data: categories,
    });
});


export const createCategory = catchAsyn(async (req, res, next) =>
{
    const { name, description } = req.body;
    if (!name)
        return next(new appError('please provide name', 404));
    const created = await prisma.category.create({
        where:
        {
            name: name,
            description: description || null,
        }
    });
    if (!created)
        return next(new appError('category not found', 404))
    next();
});


export const updateCategory = catchAsyn(async (req, res, next) =>
{
    const { id } = req.params.id;
    const { name, description } = req.body;
    if (!name)
        return next(new appError('please provide name'), 404);
    await prisma.category.update({
        where:
        {
            id: id,
        },
        name: name,
        description: description || null,
    });
    if (!updated)
        return next(new appError('category not found', 404))
    next();
});


//? if category deleted how to delete its products on other table


export const deleteCategory = catchAsyn(async (req, res, next) =>
{
    const { id } = req.params.id;
    if (!id)
        return next(new appError('please provide id'), 404);
    await prisma.category.delete({
        where:
        {
            id: id,
        },
    });
});
