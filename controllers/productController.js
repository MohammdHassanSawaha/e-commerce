import "dotenv/config";
import db from "../db.js";
import catchAsyn from './../utils/catchAsync.js'
import appError from './../utils/appError.js';


const { prisma } = db;

const DEFAULT_PAGE_SIZE = 20;


export const getProducts = catchAsyn(async (req, res, next) =>
{
	const page = Math.max(1, parseInt(req.query.page, 10) || 1);
	const skip = (page - 1) * DEFAULT_PAGE_SIZE;

	const [total, products] = await Promise.all([
		prisma.product.count(),
		prisma.product.findMany({
			skip,
			take: DEFAULT_PAGE_SIZE,
			orderBy: { createdAt: 'desc' }
		})
	]);

	res.status(200).json({
		status: 'success',
		data: products,
		meta: {
			page,
			perPage: DEFAULT_PAGE_SIZE,
			total,
			totalPages: Math.ceil(total / DEFAULT_PAGE_SIZE)
		}
	});
});


export const getProductById = catchAsyn(async (req, res, next) =>
{
	const { id } = req.params;
	if (!id)
		return next(new appError('please provide product id', 404));
	const product = await prisma.product.findUnique({
		where: { id: id }
	});

	if (!product)
		return next(new appError('product not found', 404));

	res.status(200).json({
		status: 'success',
		data: product,
	});
});


export const createProduct = catchAsyn(async (req, res, next) =>
{
	const { categoryId } = req.params;
	const { name, description, price, stock, imageUrl } = req.body;
	if (!categoryId)
		return next(new appError('please provide category id', 404));
	if (!name || price === undefined || price === null)
		return next(new appError('please provide name and price', 404));

	const category = await prisma.category.findUnique({
		where: { id: categoryId }
	});
	if (!category)
		return next(new appError('category not found', 404));

	const product = await prisma.product.create({
		data: {
			name,
			description: description || null,
			price,
			stock: stock ?? 0,
			imageUrl: imageUrl || null,
			categoryId
		}
	});

	res.status(201).json({
		status: 'success',
		data: product,
	});
});


export const updateProduct = catchAsyn(async (req, res, next) =>
{
	const { categoryId, productId } = req.params;
	const { name, description, price, stock, imageUrl } = req.body;
	if (!productId)
		return next(new appError('please provide product id', 404));

	const existing = await prisma.product.findUnique({
		where: { id: productId },
		select: { categoryId: true }
	});
	if (!existing)
		return next(new appError('product not found', 404));
	if (categoryId && existing.categoryId && existing.categoryId !== categoryId)
		return next(new appError('product does not belong to this category', 400));

	const product = await prisma.product.update({
		where: { id: productId },
		data: {
			name,
			description,
			price,
			stock,
			imageUrl,
			categoryId: categoryId || existing.categoryId || null,
		}
	});

	res.status(200).json({
		status: 'success',
		data: product,
	});
});


export const deleteProduct = catchAsyn(async (req, res, next) =>
{
	const { categoryId, productId } = req.params;
	if (!productId)
		return next(new appError('please provide product id', 404));

	const existing = await prisma.product.findUnique({
		where: { id: productId },
		select: { categoryId: true }
	});
	if (!existing)
		return next(new appError('product not found', 404));
	if (categoryId && existing.categoryId && existing.categoryId !== categoryId)
		return next(new appError('product does not belong to this category', 400));

	const deleted = await prisma.product.delete({
		where: { id: productId }
	});

	res.status(200).json({
		status: 'success',
		data: deleted,
	});
});
