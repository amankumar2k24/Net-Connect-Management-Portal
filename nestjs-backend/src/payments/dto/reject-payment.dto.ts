import { IsString, IsOptional, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectPaymentDto {
  @ApiProperty({ description: 'Reason for rejecting the payment' })
  @IsString({ message: 'Reason must be a string' })
  @IsNotEmpty({ message: 'Reason is required when rejecting a payment' })
  @MinLength(10, { message: 'Reason must be at least 10 characters long' })
  reason: string;

  @ApiProperty({ required: false, description: 'Additional notes for the rejection' })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}