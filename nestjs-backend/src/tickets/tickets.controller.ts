import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TicketStatus } from './entities/ticket.entity';
import { UserRole } from 'src/users/entities/user.entity';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new support ticket' })
    @ApiResponse({ status: 201, description: 'Ticket created successfully' })
    create(@Body() createTicketDto: CreateTicketDto, @Request() req) {
        return this.ticketsService.create(createTicketDto, req.user.id);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all tickets (Admin only)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: TicketStatus })
    findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('status') status?: TicketStatus,
    ) {
        return this.ticketsService.findAll(+page, +limit, status);
    }

    @Get('my-tickets')
    @ApiOperation({ summary: 'Get current user tickets' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findMyTickets(
        @Request() req,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
    ) {
        return this.ticketsService.findUserTickets(req.user.id, +page, +limit);
    }

    @Get('stats')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get ticket statistics (Admin only)' })
    getStats() {
        return this.ticketsService.getTicketStats();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get ticket by ID' })
    findOne(@Param('id') id: string, @Request() req) {
        // Users can only view their own tickets, admins can view any
        return this.ticketsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update ticket (Admin only)' })
    update(
        @Param('id') id: string,
        @Body() updateTicketDto: UpdateTicketDto,
        @Request() req,
    ) {
        return this.ticketsService.update(id, updateTicketDto, req.user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete ticket' })
    remove(@Param('id') id: string, @Request() req) {
        return this.ticketsService.remove(id, req.user.id, req.user.role === 'admin');
    }
}