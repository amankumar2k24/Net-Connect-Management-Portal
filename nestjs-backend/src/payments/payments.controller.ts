import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApprovePaymentDto } from './dto/approve-payment.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { PaymentStatus, PaymentMethod } from './entities/payment.entity';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  create(@Body() createPaymentDto: CreatePaymentDto, @GetUser() user: User) {
    return this.paymentsService.create(createPaymentDto, user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all payments with pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'method', required: false, enum: PaymentMethod })
  @ApiQuery({ name: 'userId', required: false, type: String })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: PaymentStatus,
    @Query('method') method?: PaymentMethod,
    @Query('userId') userId?: string,
  ) {
    return this.paymentsService.findAll(page, limit, status, method, userId);
  }

  @Get('dashboard-stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get payment dashboard statistics (Admin only)' })
  getDashboardStats() {
    return this.paymentsService.getDashboardStats();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming payments' })
  getUpcomingPayments(@GetUser() user: User) {
    const userId = user.role === UserRole.ADMIN ? undefined : user.id;
    return this.paymentsService.getUpcomingPayments(userId);
  }

  @Get('my-payments')
  @ApiOperation({ summary: 'Get current user payments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMyPayments(
    @GetUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.paymentsService.findUserPayments(user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.paymentsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment' })
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
    @GetUser() user: User,
  ) {
    return this.paymentsService.update(id, updatePaymentDto, user);
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Approve payment (Admin only)' })
  approve(
    @Param('id') id: string,
    @Body() approvePaymentDto: ApprovePaymentDto,
    @GetUser() admin: User,
  ) {
    return this.paymentsService.approve(id, approvePaymentDto, admin.id);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reject payment (Admin only)' })
  reject(
    @Param('id') id: string,
    @Body() rejectPaymentDto: RejectPaymentDto,
    @GetUser() admin: User,
  ) {
    return this.paymentsService.reject(id, rejectPaymentDto, admin.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete payment (Admin only)' })
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}