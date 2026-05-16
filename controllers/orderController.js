import "dotenv/config";
import db from "../db.js";
import catchAsync from "../utils/catchAsync.js";
import appError from "../utils/appError.js";

const { prisma } = db;
const getOrderIdFromParams = (req) => req.params.id || req.params.id;

export const createOrder = catchAsync(async (req, res, next) =>
{
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0)
    {
        return next(new appError("items is required and must be a non-empty array", 400));
    }
    for (const item of items)
    {
        if (!item.id || !item.name || item.price === undefined || item.quantity === undefined)
        {
            return next(
                new appError("Each item must have productId, name, price, and quantity", 400)
            );
        }
    }
    const total = items.reduce(
        (sum, i) => sum + Number(i.price) * Number(i.quantity),
        0
    );
    const order = await prisma.order.create({
        data: {
            id: req.user.id,
            status: "pending",
            total,
            items: {
                create: items.map((item) => ({
                    productId: item.productId,
                    productName: item.name,
                    price: Number(item.price),
                    quantity: Number(item.quantity),
                })),
            },
        },
        include: { items: true },
    });
    res.status(201).json({
        status: "success",
        data: order,
    });
});

export const getAllOrders = catchAsync(async (req, res, next) =>
{
    const id = req.user?.id;
    if (!id)
    {
        return next(new appError("user id is required", 401));
    }
    const orders = await prisma.order.findMany({
        where: { id: id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
        status: "success",
        data: orders,
    });
});

export const getOrder = catchAsync(async (req, res, next) =>
{
    const id = getOrderIdFromParams(req);
    if (!id)
    {
        return next(new appError("please provide order id", 400));
    }
    const order = await prisma.order.findUnique({
        where: { id: id },
        include: { items: true },
    });
    if (!order)
    {
        return next(new appError("order not found", 404));
    }
    res.status(200).json({
        status: "success",
        data: order,
    });
});

export const getOrderStatus = catchAsync(async (req, res, next) =>
{
    const id = getOrderIdFromParams(req);
    if (!id)
    {
        return next(new appError("please provide order id", 400));
    }
    const order = await prisma.order.findUnique({
        where: { id: id },
        select: { id: true, userId: true, status: true },
    });
    if (!order)
    {
        return next(new appError("order not found", 404));
    }
    res.status(200).json({
        status: "success",
        data: { id: order.id, status: order.status },
    });
});
