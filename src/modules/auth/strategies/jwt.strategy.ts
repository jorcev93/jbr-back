import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuenta } from '../../usuarios/entities/cuenta.entity';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(Cuenta)
    private cuentaRepository: Repository<Cuenta>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'super-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<Cuenta> {
    const cuenta = await this.cuentaRepository.findOne({
      where: { id: payload.sub, estado: true },
      relations: ['persona', 'persona.rol'],
    });

    if (!cuenta) {
      throw new UnauthorizedException('Token inválido');
    }

    return cuenta;
  }
}
