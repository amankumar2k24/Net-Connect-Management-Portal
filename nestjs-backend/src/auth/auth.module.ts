import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { EmailService } from '../common/services/email.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || '56f0931c12d4ae94f4e9c84d8c3c8c53a0c8b93eae31cf901fa6ad19425fbd13f26d6c498b1c7b7f3f844b7086fdad30a2ad19d2eb324b4695dba0a9ff3cd9e',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    }),
    SequelizeModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule { }