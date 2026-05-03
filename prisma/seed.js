import "dotenv/config";
import db from "../db.js";

const { prisma } = db;



async function main()
{
    // Categories
    const electronics = await prisma.category.upsert({
        where: { name: 'Electronics' },
        update: {
            description: 'Smartphones, laptops, accessories',
        },
        create: {
            name: 'Electronics',
            description: 'Smartphones, laptops, accessories',
        },
    });

    const clothing = await prisma.category.upsert({
        where: { name: 'Clothing' },
        update: {
            description: 'Men’s and women’s fashion',
        },
        create: {
            name: 'Clothing',
            description: 'Men’s and women’s fashion',
        },
    });

    await prisma.category.upsert({
        where: { name: 'Books' },
        update: {
            description: 'Physical and digital books',
        },
        create: {
            name: 'Books',
            description: 'Physical and digital books',
        },
    });

    await prisma.product.deleteMany({
        where: {
            OR: [
                { name: 'Smartphone XYZ Pro' },
                { name: 'UltraSlim Notebook 14"' },
                { name: 'Dev Mode T-Shirt' },
            ],
        },
    });

    // Products
    await prisma.product.create({
        data: {
            name: 'Smartphone XYZ Pro',
            description: '6.5" AMOLED display, 108MP camera, 5000mAh battery',
            price: 2499.9,
            stock: 50,
            categoryId: electronics.id,
            imageUrl: 'https://placehold.co/400x400?text=Smartphone',
        },
    });

    await prisma.product.create({
        data: {
            name: 'UltraSlim Notebook 14"',
            description: 'Intel Core i5, 16GB RAM, 512GB SSD',
            price: 4299.0,
            stock: 20,
            categoryId: electronics.id,
            imageUrl: 'https://placehold.co/400x400?text=Notebook',
        },
    });

    await prisma.product.create({
        data: {
            name: 'Dev Mode T-Shirt',
            description: '100% cotton, multiple colors',
            price: 79.9,
            stock: 200,
            categoryId: clothing.id,
            imageUrl: 'https://placehold.co/400x400?text=T-Shirt',
        },
    });
}

main()
    .then(async () =>
    {
        await prisma.$disconnect();
    })
    .catch(async (e) =>
    {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });