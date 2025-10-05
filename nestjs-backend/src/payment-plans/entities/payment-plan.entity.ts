import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table({
    tableName: 'payment_plans',
    timestamps: true,
})
export class PaymentPlan extends Model<PaymentPlan> {
    @ApiProperty()
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @ApiProperty()
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    durationMonths: number;

    @ApiProperty()
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    durationLabel: string; // e.g., "1 Month", "3 Months", "6 Months"

    @ApiProperty()
    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    amount: number;

    @ApiProperty()
    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    isActive: boolean;

    @ApiProperty()
    @Column({
        type: DataType.INTEGER,
        defaultValue: 0,
    })
    sortOrder: number;
}