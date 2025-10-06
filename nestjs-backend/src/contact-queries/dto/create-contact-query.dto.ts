import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactQueryDto {
    @ApiProperty({
        description: 'Full name of the person submitting the query',
        example: 'John Doe',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    fullName: string;

    @ApiProperty({
        description: 'Email address',
        example: 'john.doe@example.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Phone number (optional)',
        example: '+1234567890',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    phone?: string;

    @ApiProperty({
        description: 'Subject of the query',
        example: 'WiFi Connection Issues',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(200)
    subject: string;

    @ApiProperty({
        description: 'Detailed message',
        example: 'I am experiencing connectivity issues with my WiFi connection...',
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(2000)
    message: string;

    @ApiProperty({
        description: 'Company name (optional)',
        example: 'Tech Corp Inc.',
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    company?: string;
}