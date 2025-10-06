import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

export enum ContactQueryStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed'
}

export enum ContactQueryPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
}

@Table({
    tableName: 'contact_queries',
    timestamps: true,
})
export class ContactQuery extends Model<ContactQuery> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    fullName: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    })
    email: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    phone: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    subject: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    message: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    company: string;

    @Column({
        type: DataType.ENUM(...Object.values(ContactQueryStatus)),
        allowNull: false,
        defaultValue: ContactQueryStatus.PENDING,
    })
    status: ContactQueryStatus;

    @Column({
        type: DataType.ENUM(...Object.values(ContactQueryPriority)),
        allowNull: false,
        defaultValue: ContactQueryPriority.MEDIUM,
    })
    priority: ContactQueryPriority;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    adminNotes: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    assignedToUserId: number;

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