import { prisma } from './src/config/db.js';

const STANDARD_ACCOUNTS = [
    { name: 'Technical Department', type: 'DEPARTMENT' },
    { name: 'Admin Department', type: 'DEPARTMENT' },
    { name: 'Sales Department', type: 'DEPARTMENT' },
    { name: 'Marketing Department', type: 'DEPARTMENT' },
    { name: 'Project / Event', type: 'EVENT' }
];

async function standardize() {
    console.log('Starting Analytical Account Standardization...');

    try {
        // 1. Ensure Standard Accounts Exist
        const standardIds = {};
        for (const acc of STANDARD_ACCOUNTS) {
            const upserted = await prisma.analyticalAccount.upsert({
                where: { name: acc.name },
                update: { type: acc.type },
                create: { name: acc.name, type: acc.type }
            });
            standardIds[acc.name] = upserted.id;
            console.log(`Ensured: ${acc.name}`);
        }

        // 2. Fetch All Accounts
        const allAccounts = await prisma.analyticalAccount.findMany();
        const standardNames = STANDARD_ACCOUNTS.map(a => a.name);
        const toCleanup = allAccounts.filter(a => !standardNames.includes(a.name));

        console.log(`Found ${toCleanup.length} potential duplicate/legacy accounts.`);

        // 3. Migrate & Cleanup or Delete
        for (const oldAcc of toCleanup) {
            let targetId = null;

            // Logic to map old names to new standard logic
            const lowerName = oldAcc.name.toLowerCase();
            if (lowerName.includes('marketing')) targetId = standardIds['Marketing Department'];
            else if (lowerName.includes('sales')) targetId = standardIds['Sales Department'];
            else if (lowerName.includes('technical')) targetId = standardIds['Technical Department'];
            else if (lowerName.includes('admin')) targetId = standardIds['Admin Department'];
            else if (lowerName.includes('project') || lowerName.includes('event')) targetId = standardIds['Project / Event'];

            if (targetId) {
                console.log(`Migrating ${oldAcc.name} -> Target Standard`);

                // Migrate Auto Models
                await prisma.autoAnalyticalModel.updateMany({
                    where: { analyticalAccountId: oldAcc.id },
                    data: { analyticalAccountId: targetId }
                });

                // Migrate Budgets
                await prisma.budget.updateMany({
                    where: { analyticalAccountId: oldAcc.id },
                    data: { analyticalAccountId: targetId }
                });

                // Migrate Lines (Optional fields, but good to clean up)
                await prisma.salesOrderLine.updateMany({ where: { analyticalAccountId: oldAcc.id }, data: { analyticalAccountId: targetId } });
                await prisma.purchaseOrderLine.updateMany({ where: { analyticalAccountId: oldAcc.id }, data: { analyticalAccountId: targetId } });
                await prisma.vendorBillLine.updateMany({ where: { analyticalAccountId: oldAcc.id }, data: { analyticalAccountId: targetId } });
                await prisma.customerInvoiceLine.updateMany({ where: { analyticalAccountId: oldAcc.id }, data: { analyticalAccountId: targetId } });
            }

            // Try Delete
            try {
                await prisma.analyticalAccount.delete({ where: { id: oldAcc.id } });
                console.log(`Deleted legacy account: ${oldAcc.name}`);
            } catch (err) {
                // Likely FK constraint we missed or didn't migrate
                console.warn(`Could not delete ${oldAcc.name} (likely still in use).`);
            }
        }

        console.log('Standardization Complete.');

    } catch (e) {
        console.error('Migration Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

standardize();
