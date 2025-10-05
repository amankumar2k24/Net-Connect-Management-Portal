import { PartialType } from '@nestjs/swagger';
import { CreatePaymentPlanDto } from './create-payment-plan.dto';
import { IsNumber, IsString, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdatePaymentPlanDto extends PartialType(CreatePaymentPlanDto) {
    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Duration months must be a valid number' })
    @Min(1, { message: 'Duration months must be at least 1' })
    durationMonths?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    durationLabel?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Amount must be a valid number' })
    @Min(0, { message: 'Amount must not be less than 0' })
    amount?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isActive?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'Sort order must be a valid number' })
    sortOrder?: number;
}