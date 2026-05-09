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
        data:
        {
            name: name,
            description: description || null,
        }
    });
    res.status(201).json({
        status: 'success',
        data: created,
    });
});


export const updateCategory = catchAsyn(async (req, res, next) =>
{
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name)
        return next(new appError('please provide name'), 404);
    const existing = await prisma.category.findUnique({
        where: { id: id },
    });
    if (!existing)
        return next(new appError('category not found', 404));
    const updated = await prisma.category.update({
        where:
        {
            id: id,
        },
        data: {
            name: name,
            description: description || null,
        },
    });
    res.status(200).json({
        status: 'success',
        data: updated,
    });
});


//? if category deleted how to delete its products on other table


export const deleteCategory = catchAsyn(async (req, res, next) =>
{
    const { id } = req.params;
    if (!id)
        return next(new appError('please provide id'), 404);
    const existing = await prisma.category.findUnique({
        where: { id: id },
    });
    if (!existing)
        return next(new appError('category not found', 404));
    const deleted = await prisma.category.delete({
        where:
        {
            id: id,
        },
    });
    res.status(200).json({
        status: 'success',
        data: deleted,
    });
});
