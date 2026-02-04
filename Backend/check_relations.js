import { prisma } from './src/config/db.js';

async function check() {
    try {
        const product = await prisma.product.findUnique({ where: { name: "Wooden Chair" } });
        if (!product) {
            console.log("Product 'Wooden Chair' not found");
            return;
        }
        const orders = await prisma.salesOrderLine.findMany({
            where: { productId: product.id },
            include: { salesOrder: true }
        });

        console.log(`Found ${orders.length} orders containing 'Wooden Chair':`);
        orders.forEach(o => console.log(`- Order #${o.salesOrder.number} (Status: ${o.salesOrder.status})`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
check();
