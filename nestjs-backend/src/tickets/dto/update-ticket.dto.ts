import { IsString, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus, TicketPriority } from '../entities/ticket.entity';

export class UpdateTicketDto {
    @ApiProperty({ description: 'Ticket status', enum: TicketStatus })
    @IsEnum(TicketStatus)
    @IsOptional()
    status?: TicketStatus;

    @ApiProperty({ description: 'Ticket priority', enum: TicketPriority })
    @IsEnum(TicketPriority)
    @IsOptional()
    priority?: TicketPriority;

    @ApiProperty({ description: 'Admin response to the ticket' })
    @IsString()
    @IsOptional()
    @MaxLength(2000)
    adminResponse?: string;

    @ApiProperty({ description: 'ID of admin to assign ticket to' })
    @IsString()
    @IsOptional()
    assignedToId?: string;
}