import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

@Table({
    tableName: 'admin_settings',
    timestamps: true,
})
export class AdminSettings extends Model<AdminSettings> {
    @ApiProperty()
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @ApiProperty()
    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    qrCodeUrl: string;

    @ApiProperty()
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    upiNumber: string;

    @ApiProperty()
    @CreatedAt
    createdAt: Date;

    @ApiProperty()
    @UpdatedAt
    updatedAt: Date;
}