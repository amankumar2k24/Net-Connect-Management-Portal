import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { User } from '../users/entities/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TicketsService {
    constructor(
        @InjectModel(Ticket)
        private ticketModel: typeof Ticket,
        private notificationsService: NotificationsService,
    ) { }

    async create(createTicketDto: CreateTicketDto, userId: string): Promise<Ticket> {
        const ticket = await this.ticketModel.create({
            ...createTicketDto,
            userId,
        });

        // Create notification for admins about new ticket
        await this.notificationsService.createNotificationForAdmins(
            'New Support Ticket',
            `A new support ticket "${ticket.title}" has been created by user ID ${userId}`
        );

        return this.findOne(ticket.id);
    }

    async findAll(page: number = 1, limit: number = 10, status?: TicketStatus): Promise<{
        tickets: Ticket[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const offset = (page - 1) * limit;
        const whereClause = status ? { status } : {};

        const { count, rows } = await this.ticketModel.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        return {
            tickets: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        };
    }

    async findUserTickets(userId: string, page: number = 1, limit: number = 10): Promise<{
        tickets: Ticket[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const offset = (page - 1) * limit;

        const { count, rows } = await this.ticketModel.findAndCountAll({
            where: { userId },
            include: [
                { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        return {
            tickets: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        };
    }

    async findOne(id: string): Promise<Ticket> {
        const ticket = await this.ticketModel.findByPk(id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
            ],
        });

        if (!ticket) {
            throw new NotFoundException('Ticket not found');
        }

        return ticket;
    }

    async update(id: string, updateTicketDto: UpdateTicketDto, adminId: string): Promise<Ticket> {
        const ticket = await this.findOne(id);

        // Update ticket
        await ticket.update({
            ...updateTicketDto,
            ...(updateTicketDto.status === TicketStatus.RESOLVED && { resolvedAt: new Date() }),
        });

        // Create notification for user about ticket update
        let notificationMessage = `Your ticket "${ticket.title}" has been updated`;

        if (updateTicketDto.status) {
            notificationMessage += ` - Status: ${updateTicketDto.status}`;
        }

        if (updateTicketDto.adminResponse) {
            notificationMessage += ` - Response: ${updateTicketDto.adminResponse}`;
        }

        await this.notificationsService.createNotification(
            ticket.userId,
            'Ticket Updated',
            notificationMessage
        );

        return this.findOne(id);
    }

    async remove(id: string, userId: string, isAdmin: boolean): Promise<void> {
        const ticket = await this.findOne(id);

        // Users can only delete their own tickets, admins can delete any
        if (!isAdmin && ticket.userId !== userId) {
            throw new ForbiddenException('You can only delete your own tickets');
        }

        await ticket.destroy();
    }

    async getTicketStats(): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
    }> {
        const [total, open, inProgress, resolved, closed] = await Promise.all([
            this.ticketModel.count(),
            this.ticketModel.count({ where: { status: TicketStatus.OPEN } }),
            this.ticketModel.count({ where: { status: TicketStatus.IN_PROGRESS } }),
            this.ticketModel.count({ where: { status: TicketStatus.RESOLVED } }),
            this.ticketModel.count({ where: { status: TicketStatus.CLOSED } }),
        ]);

        return { total, open, inProgress, resolved, closed };
    }
}