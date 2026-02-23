import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Cuenta } from '../usuarios/entities/cuenta.entity';
import { Persona } from '../usuarios/entities/persona.entity';
import { Rol } from '../usuarios/entities/rol.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto, LoginDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Cuenta)
    private cuentaRepository: Repository<Cuenta>,
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, nombre, apellido, genero, fechaNacimiento } =
      registerDto;

    const existingCuenta = await this.cuentaRepository.findOne({
      where: { email },
    });

    if (existingCuenta) {
      throw new ConflictException('El email ya está registrado');
    }

    const rolUser = await this.rolRepository.findOne({
      where: { nombre: 'user', estado: true },
    });

    const persona = this.personaRepository.create({
      nombre,
      apellido,
      genero,
      ...(rolUser && { rolId: rolUser.id }),
      ...(fechaNacimiento && { fechaNacimiento: new Date(fechaNacimiento) }),
    });

    await this.personaRepository.save(persona);

    const hashedPassword = await bcrypt.hash(password, 10);

    const cuenta = this.cuentaRepository.create({
      email,
      password: hashedPassword,
      personaId: persona.id,
    });

    await this.cuentaRepository.save(cuenta);

    const tokens = await this.generateTokens(cuenta);

    return {
      message: 'Usuario registrado exitosamente',
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const cuenta = await this.cuentaRepository.findOne({
      where: { email, estado: true },
      relations: ['persona', 'persona.rol'],
    });

    if (!cuenta) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, cuenta.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const tokens = await this.generateTokens(cuenta);

    return {
      message: 'Login exitoso',
      user: {
        id: cuenta.id,
        email: cuenta.email,
        persona: {
          id: cuenta.persona.id,
          nombre: cuenta.persona.nombre,
          apellido: cuenta.persona.apellido,
          rol: cuenta.persona.rol,
        },
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: {
        token: refreshToken,
        revoked: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['cuenta', 'cuenta.persona'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    await this.refreshTokenRepository.update(tokenRecord.id, { revoked: true });

    const tokens = await this.generateTokens(tokenRecord.cuenta);

    return {
      message: 'Tokens renovados',
      ...tokens,
    };
  }

  async logout(refreshToken: string) {
    await this.refreshTokenRepository.update(
      { token: refreshToken },
      { revoked: true },
    );

    return { message: 'Sesión cerrada exitosamente' };
  }

  async logoutAll(cuentaId: string) {
    await this.refreshTokenRepository.update(
      { cuentaId, revoked: false },
      { revoked: true },
    );

    return { message: 'Todas las sesiones han sido cerradas' };
  }

  private async generateTokens(cuenta: Cuenta) {
    const payload = { sub: cuenta.id, email: cuenta.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION') || '15m',
    });

    const refreshTokenValue = uuidv4();
    const refreshExpirationDays = parseInt(
      this.configService.get('JWT_REFRESH_EXPIRATION_DAYS') || '7',
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshExpirationDays);

    const refreshToken = this.refreshTokenRepository.create({
      token: refreshTokenValue,
      cuentaId: cuenta.id,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }
}
