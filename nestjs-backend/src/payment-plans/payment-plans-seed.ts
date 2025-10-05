import { PaymentPlan } from './entities/payment-plan.entity';

export const seedPaymentPlans = async () => {
    const defaultPlans = [
        {
            durationMonths: 1,
            durationLabel: '1 Month',
            amount: 500,
            isActive: true,
            sortOrder: 1,
        },
        {
            durationMonths: 3,
            durationLabel: '3 Months',
            amount: 1400,
            isActive: true,
            sortOrder: 2,
        },
        {
            durationMonths: 6,
            durationLabel: '6 Months',
            amount: 2700,
            isActive: true,
            sortOrder: 3,
        },
        {
            durationMonths: 12,
            durationLabel: '1 Year',
            amount: 5000,
            isActive: true,
            sortOrder: 4,
        },
    ];

    for (const planData of defaultPlans) {
        const existingPlan = await PaymentPlan.findOne({
            where: { durationMonths: planData.durationMonths },
        });

        if (!existingPlan) {
            await PaymentPlan.create(planData);
            console.log(`Created payment plan: ${planData.durationLabel}`);
        }
    }

    console.log('Payment plans seeding completed');
};