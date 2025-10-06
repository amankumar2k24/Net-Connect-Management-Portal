import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, MaxLength } from 'class-validator';
import { CreateContactQueryDto } from './create-contact-query.dto';
import { ContactQueryStatus, ContactQueryPriority } from '../entities/contact-query.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContactQueryDto extends PartialType(CreateContactQueryDto) {
    @ApiProperty({
        description: 'Status of the contact query',
        enum: ContactQueryStatus,
        required: false,
    })
    @IsOptional()
    @IsEnum(ContactQueryStatus)
    status?: ContactQueryStatus;

    @ApiProperty({
        description: 'Priority level of the query',
        enum: ContactQueryPriority,
        required: false,
    })
    @IsOptional()
    @IsEnum(ContactQueryPriority)
    priority?: ContactQueryPriority;

    @ApiProperty({
        description: 'Admin notes for internal use',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    adminNotes?: string;

    @ApiProperty({
        description: 'ID of the admin user assigned to handle this query',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    assignedToUserId?: number;
}