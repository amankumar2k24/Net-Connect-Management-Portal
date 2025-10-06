import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentPlansService } from './payment-plans.service';
import { CreatePaymentPlanDto } from './dto/create-payment-plan.dto';
import { UpdatePaymentPlanDto } from './dto/update-payment-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Payment Plans')
@Controller('payment-plans')
export class PaymentPlansController {
    constructor(private readonly paymentPlansService: PaymentPlansService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create payment plan (Admin only)' })
    @ApiResponse({ status: 201, description: 'Payment plan created successfully' })
    create(@Body() createPaymentPlanDto: CreatePaymentPlanDto) {
        console.log('🔍 Payment Plan Controller - Received data:', createPaymentPlanDto);
        console.log('🔍 Payment Plan Controller - Data types:', {
            durationMonths: typeof createPaymentPlanDto.durationMonths,
            amount: typeof createPaymentPlanDto.amount,
            sortOrder: typeof createPaymentPlanDto.sortOrder
        });
        return this.paymentPlansService.create(createPaymentPlanDto);
    }

    @Get('public')
    @ApiOperation({ summary: 'Get all active payment plans for public display' })
    @ApiResponse({ status: 200, description: 'Payment plans retrieved successfully' })
    findAllPublic() {
        return this.paymentPlansService.findActive();
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all payment plans (Admin only)' })
    @ApiResponse({ status: 200, description: 'Payment plans retrieved successfully' })
    findAll() {
        return this.paymentPlansService.findAll();
    }

    @Get('active')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get active payment plans' })
    @ApiResponse({ status: 200, description: 'Active payment plans retrieved successfully' })
    findActive() {
        return this.paymentPlansService.findActive();
    }

    @Patch('reorder')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reorder payment plans (Admin only)' })
    @ApiResponse({ status: 200, description: 'Payment plans reordered successfully' })
    reorder(@Body() reorderData: { id: string; sortOrder: number }[]) {
        return this.paymentPlansService.reorder(reorderData);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get payment plan by ID (Admin only)' })
    @ApiResponse({ status: 200, description: 'Payment plan retrieved successfully' })
    findOne(@Param('id') id: string) {
        return this.paymentPlansService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update payment plan (Admin only)' })
    @ApiResponse({ status: 200, description: 'Payment plan updated successfully' })
    update(@Param('id') id: string, @Body() updatePaymentPlanDto: UpdatePaymentPlanDto) {
        console.log('🔍 Payment Plan Update Controller - ID:', id);
        console.log('🔍 Payment Plan Update Controller - Data:', updatePaymentPlanDto);
        console.log('🔍 Payment Plan Update Controller - Data types:', {
            durationMonths: typeof updatePaymentPlanDto.durationMonths,
            amount: typeof updatePaymentPlanDto.amount,
            sortOrder: typeof updatePaymentPlanDto.sortOrder
        });
        return this.paymentPlansService.update(id, updatePaymentPlanDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete payment plan (Admin only)' })
    @ApiResponse({ status: 200, description: 'Payment plan deleted successfully' })
    remove(@Param('id') id: string) {
        return this.paymentPlansService.remove(id);
    }
}