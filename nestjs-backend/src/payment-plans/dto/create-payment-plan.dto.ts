import { IsNumber, IsString, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentPlanDto {
    @ApiProperty()
    @Type(() => Number)
    @IsNumber({}, { message: 'Duration months must be a valid number' })
    @Min(1, { message: 'Duration months must be at least 1' })
    durationMonths: number;

    @ApiProperty()
    @IsString()
    durationLabel: string;

    @ApiProperty()
    @Type(() => Number)
    @IsNumber({}, { message: 'Amount must be a valid number' })
    @Min(0, { message: 'Amount must not be less than 0' })
    amount: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Sort order must be a valid number' })
    sortOrder?: number;
}