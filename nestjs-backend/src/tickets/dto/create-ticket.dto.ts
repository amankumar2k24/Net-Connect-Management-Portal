import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketCategory, TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
    @ApiProperty({ description: 'Ticket title', example: 'Internet connection issue' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @ApiProperty({ description: 'Detailed description of the issue', example: 'My internet has been slow for the past 2 days...' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    description: string;

    @ApiProperty({
        description: 'Ticket category',
        enum: TicketCategory,
        example: TicketCategory.TECHNICAL
    })
    @IsEnum(TicketCategory)
    @IsOptional()
    category?: TicketCategory;

    @ApiProperty({
        description: 'Ticket priority',
        enum: TicketPriority,
        example: TicketPriority.MEDIUM
    })
    @IsEnum(TicketPriority)
    @IsOptional()
    priority?: TicketPriority;
}