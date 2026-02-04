import { prisma } from "./src/config/db.js";

async function checkData() {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        console.log("Six Months Ago:", sixMonthsAgo.toISOString());

        const count = await prisma.vendorBill.count({
            where: {
                status: { in: ["CONFIRMED", "PAID", "PARTIALLY_PAID"] },
                billDate: { gte: sixMonthsAgo },
            }
        });
        console.log(`Filtered VendorBills Count: ${count}`);

        const expenses = await prisma.vendorBill.findMany({
            where: {
                status: { in: ["CONFIRMED", "PAID", "PARTIALLY_PAID"] },
                billDate: { gte: sixMonthsAgo },
            },
            select: { billDate: true, total: true, status: true },
        });
        console.log("Filtered Expenses:", JSON.stringify(expenses, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
