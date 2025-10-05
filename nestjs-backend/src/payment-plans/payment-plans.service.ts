import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PaymentPlan } from './entities/payment-plan.entity';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';
import { UpdatePaymentPlanDto } from './dto/update-payment-plan.dto';

@Injectable()
export class PaymentPlansService {
    constructor(
        @InjectModel(PaymentPlan)
        private paymentPlanModel: typeof PaymentPlan,
    ) { }

    async create(createPaymentPlanDto: CreatePaymentPlanDto) {
        const paymentPlan = await this.paymentPlanModel.create(createPaymentPlanDto);
        return { paymentPlan };
    }

    async findAll() {
        const paymentPlans = await this.paymentPlanModel.findAll({
            order: [['sortOrder', 'ASC'], ['durationMonths', 'ASC']],
        });
        return { paymentPlans };
    }

    async findActive() {
        const paymentPlans = await this.paymentPlanModel.findAll({
            where: { isActive: true },
            order: [['sortOrder', 'ASC'], ['durationMonths', 'ASC']],
        });
        return { paymentPlans };
    }

    async findOne(id: string) {
        const paymentPlan = await this.paymentPlanModel.findByPk(id);
        if (!paymentPlan) {
            throw new NotFoundException('Payment plan not found');
        }
        return { paymentPlan };
    }

    async update(id: string, updatePaymentPlanDto: UpdatePaymentPlanDto) {
        console.log('🔍 Payment Plan Service Update - ID:', id);
        console.log('🔍 Payment Plan Service Update - Data:', updatePaymentPlanDto);

        const paymentPlan = await this.paymentPlanModel.findByPk(id);
        if (!paymentPlan) {
            console.log('❌ Payment plan not found with ID:', id);
            throw new NotFoundException('Payment plan not found');
        }

        console.log('✅ Found payment plan:', paymentPlan.toJSON());

        try {
            // Add data type logging
            console.log('🔍 Data types before update:', {
                durationMonths: typeof updatePaymentPlanDto.durationMonths,
                amount: typeof updatePaymentPlanDto.amount,
                sortOrder: typeof updatePaymentPlanDto.sortOrder,
                isActive: typeof updatePaymentPlanDto.isActive
            });

            const updatedPlan = await paymentPlan.update(updatePaymentPlanDto);
            console.log('✅ Payment plan updated successfully:', updatedPlan.toJSON());

            // Reload to get fresh data
            await updatedPlan.reload();

            return { paymentPlan: updatedPlan };
        } catch (error) {
            console.log('❌ Error updating payment plan:', error);
            console.log('❌ Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
    }

    async reorder(reorderData: { id: string; sortOrder: number }[]) {
        // Update sort orders in a transaction
        await this.paymentPlanModel.sequelize.transaction(async (transaction) => {
            for (const item of reorderData) {
                await this.paymentPlanModel.update(
                    { sortOrder: item.sortOrder },
                    { where: { id: item.id }, transaction }
                );
            }
        });

        // Return updated payment plans
        const paymentPlans = await this.paymentPlanModel.findAll({
            order: [['sortOrder', 'ASC'], ['durationMonths', 'ASC']],
        });
        return { paymentPlans };
    }

    async remove(id: string) {
        const paymentPlan = await this.paymentPlanModel.findByPk(id);
        if (!paymentPlan) {
            throw new NotFoundException('Payment plan not found');
        }

        await paymentPlan.destroy();
        return { message: 'Payment plan deleted successfully' };
    }
}