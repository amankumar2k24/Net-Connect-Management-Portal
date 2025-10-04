import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '56f0931c12d4ae94f4e9c84d8c3c8c53a0c8b93eae31cf901fa6ad19425fbd13f26d6c498b1c7b7f3f844b7086fdad30a2ad19d2eb324b4695dba0a9ff3cd9e',
    });
  }

  async validate(payload: any) {
    return this.authService.validateUser(payload);
  }
}