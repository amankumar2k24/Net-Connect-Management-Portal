import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ContactQuery, ContactQueryStatus } from './entities/contact-query.entity';
import { CreateContactQueryDto } from './dto/create-contact-query.dto';
import { UpdateContactQueryDto } from './dto/update-contact-query.dto';
import { EmailService } from '../common/services/email.service';

@Injectable()
export class ContactQueriesService {
    constructor(
        @InjectModel(ContactQuery)
        private contactQueryModel: typeof ContactQuery,
        private emailService: EmailService,
    ) { }

    async create(createContactQueryDto: CreateContactQueryDto): Promise<ContactQuery> {
        const contactQuery = await this.contactQueryModel.create(createContactQueryDto);

        // Send notification email to admin
        try {
            await this.emailService.sendContactQueryNotification(contactQuery);
        } catch (error) {
            console.error('Failed to send contact query notification:', error);
            // Don't fail the request if email fails
        }

        return contactQuery;
    }

    async findAll(page: number = 1, limit: number = 10, status?: ContactQueryStatus): Promise<{
        queries: ContactQuery[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const offset = (page - 1) * limit;
        const whereClause = status ? { status } : {};

        const { count, rows } = await this.contactQueryModel.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });

        return {
            queries: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        };
    }

    async findOne(id: number): Promise<ContactQuery> {
        const contactQuery = await this.contactQueryModel.findByPk(id);
        if (!contactQuery) {
            throw new NotFoundException(`Contact query with ID ${id} not found`);
        }
        return contactQuery;
    }

    async update(id: number, updateContactQueryDto: UpdateContactQueryDto): Promise<ContactQuery> {
        const contactQuery = await this.findOne(id);

        // If status is being changed to resolved, set resolvedAt timestamp
        if (updateContactQueryDto.status === ContactQueryStatus.RESOLVED &&
            contactQuery.status !== ContactQueryStatus.RESOLVED) {
            updateContactQueryDto['resolvedAt'] = new Date();
        }

        await contactQuery.update(updateContactQueryDto);
        return contactQuery;
    }

    async remove(id: number): Promise<void> {
        const contactQuery = await this.findOne(id);
        await contactQuery.destroy();
    }

    async getStats(): Promise<{
        total: number;
        pending: number;
        inProgress: number;
        resolved: number;
        closed: number;
    }> {
        const [total, pending, inProgress, resolved, closed] = await Promise.all([
            this.contactQueryModel.count(),
            this.contactQueryModel.count({ where: { status: ContactQueryStatus.PENDING } }),
            this.contactQueryModel.count({ where: { status: ContactQueryStatus.IN_PROGRESS } }),
            this.contactQueryModel.count({ where: { status: ContactQueryStatus.RESOLVED } }),
            this.contactQueryModel.count({ where: { status: ContactQueryStatus.CLOSED } }),
        ]);

        return {
            total,
            pending,
            inProgress,
            resolved,
            closed,
        };
    }
}