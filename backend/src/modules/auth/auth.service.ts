/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../users/user.entity';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(RefreshToken) private tokens: Repository<RefreshToken>,
    private jwt: JwtService,
  ) {}

  refreshTtl = Number(process.env.JWT_REFRESH_TTL_DAYS ?? 30);

  async register(email: string, password: string) {
    const user = this.users.create({
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      role: UserRole.CUSTOMER,
    });
    await this.users.save(user);
    return this.issue(user);
  }

  async login(email: string, password: string) {
    const user = await this.users.findOneBy({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      throw new UnauthorizedException('Invalid credentials');
    return this.issue(user);
  }

  async refresh(refreshToken: string) {
    const payload = this.jwt.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET!,
    });
    const saved = await this.tokens.findOneBy({
      id: payload.jti,
      revoked: false,
    });
    if (
      !saved ||
      !(await bcrypt.compare(refreshToken, saved.tokenHash)) ||
      saved.expiresAt < new Date()
    )
      throw new UnauthorizedException('Invalid refresh token');
    await this.tokens.update(saved.id, { revoked: true });
    const user = await this.users.findOneByOrFail({ id: payload.sub });
    return this.issue(user);
  }

  async issue(user: User) {
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: `${this.refreshTtl}d` as const,
      },
    );
    const row = await this.tokens.save(
      this.tokens.create({
        userId: user.id,
        tokenHash: 'pending',
        expiresAt: new Date(
          Date.now() +
            Number(process.env.JWT_REFRESH_TTL_DAYS ?? 30) * 86400000,
        ),
      }),
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, jti: row.id },
      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: `${this.refreshTtl}d` as const,
      },
    );
    row.tokenHash = await bcrypt.hash(refreshToken, 12);
    await this.tokens.save(row);
    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
