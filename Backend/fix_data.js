import { prisma } from './src/config/db.js';

async function fix() {
    try {
        // Fix Cement
        await prisma.product.updateMany({
            where: { name: { contains: "cement", mode: "insensitive" } },
            data: { unit: "Kg", unitValue: 50 }
        });
        console.log("Updated Cement to 50 Kg");

        // Fix Phone
        await prisma.product.updateMany({
            where: { name: { contains: "phone", mode: "insensitive" } },
            data: { unit: "Piece", unitValue: 1 }
        });
        console.log("Updated Phone to 1 Piece");

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
fix();
