import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateAdminSettingsDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    qrCodeUrl?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    upiNumber?: string;
}