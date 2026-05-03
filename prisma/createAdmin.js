import "dotenv/config";
import db from "../db.js";

const { prisma } = db;

async function main()
{
    await prisma.user.upsert({
        where: { email: "admin@ecommerce.local" },
        update: {},
        create: {
            name: "Administrador",
            email: "admin@ecommerce.local",
            password_hash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
            role: "admin",
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