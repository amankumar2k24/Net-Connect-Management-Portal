import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PaymentPlansService } from './payment-plans.service';
import { PaymentPlansController } from './payment-plans.controller';
import { PaymentPlan } from './entities/payment-plan.entity';

@Module({
    imports: [SequelizeModule.forFeature([PaymentPlan])],
    controllers: [PaymentPlansController],
    providers: [PaymentPlansService],
    exports: [PaymentPlansService],
})
export class PaymentPlansModule { }