import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  qrCodeUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  upiId?: string;
}