import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string; // Legacy field for backward compatibility

    @ApiProperty({ required: false, description: 'Phone number must be exactly 10 digits' })
    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{10}$/, { message: 'Phone number must be exactly 10 digits' })
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address?: string;
}