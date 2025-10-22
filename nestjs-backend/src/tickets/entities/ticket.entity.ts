import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { User } from '../../users/entities/user.entity';

export enum TicketStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed'
}

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
}

export enum TicketCategory {
    TECHNICAL = 'technical',
    BILLING = 'billing',
    GENERAL = 'general',
    COMPLAINT = 'complaint'
}

@Table({
    tableName: 'tickets',
    timestamps: true,
})
export class Ticket extends Model<Ticket> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    description: string;

    @Column({
        type: DataType.ENUM(...Object.values(TicketCategory)),
        allowNull: false,
        defaultValue: TicketCategory.GENERAL,
    })
    category: TicketCategory;

    @Column({
        type: DataType.ENUM(...Object.values(TicketPriority)),
        allowNull: false,
        defaultValue: TicketPriority.MEDIUM,
    })
    priority: TicketPriority;

    @Column({
        type: DataType.ENUM(...Object.values(TicketStatus)),
        allowNull: false,
        defaultValue: TicketStatus.OPEN,
    })
    status: TicketStatus;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId: string;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    assignedToId: string;

    @BelongsTo(() => User, 'assignedToId')
    assignedTo: User;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    adminResponse: string;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    resolvedAt: Date;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}